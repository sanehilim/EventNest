import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

const pinataApi = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
  },
});

export async function uploadFileToPinata(file: Buffer, filename: string): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([file]);
  formData.append('file', blob, filename);
  
  const metadata = JSON.stringify({
    name: filename,
  });
  formData.append('pinataMetadata', metadata);

  const response = await pinataApi.post('/pinning/pinFileToIPFS', formData, {
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.IpfsHash;
}

export async function uploadJSONToPinata(json: object, name: string): Promise<string> {
  const response = await pinataApi.post('/pinning/pinJSONToIPFS', {
    pinataContent: json,
    pinataMetadata: {
      name: name,
    },
  });

  return response.data.IpfsHash;
}

export function getIPFSUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export async function uploadEventMetadata(event: {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}): Promise<string> {
  const metadata = {
    name: event.name,
    description: event.description,
    image: event.image,
    attributes: event.attributes,
  };

  return uploadJSONToPinata(metadata, `${event.name}-metadata`);
}
