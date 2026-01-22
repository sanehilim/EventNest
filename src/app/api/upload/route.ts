import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONToPinata } from '@/lib/pinata';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.error('Missing Pinata credentials');
      return NextResponse.json(
        { error: 'Missing Pinata credentials' },
        { status: 500 }
      );
    }

    const formDataPinata = new FormData();
    formDataPinata.append('file', new Blob([buffer]), file.name);
    formDataPinata.append('pinataMetadata', JSON.stringify({ name: file.name }));

    console.log('Uploading to Pinata...');

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formDataPinata,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Pinata API error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to upload to Pinata' },
        { status: response.status }
      );
    }

    if (!data.IpfsHash) {
      console.error('No IpfsHash in response:', data);
      return NextResponse.json(
        { error: 'Invalid response from Pinata' },
        { status: 500 }
      );
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    
    console.log('Upload successful:', { cid: data.IpfsHash, ipfsUrl });

    return NextResponse.json({ 
      cid: data.IpfsHash,
      ipfsUrl: ipfsUrl,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, name } = body;

    const cid = await uploadJSONToPinata(metadata, name);
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

    return NextResponse.json({ cid, url, ipfsUrl: url });
  } catch (error: any) {
    console.error('Error uploading metadata:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload metadata' },
      { status: 500 }
    );
  }
}