const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

type Response = {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  errorMessage: string;
  addresses: Address[];
};

export type Address = {
  roadAddress: string;
  jibunAddress: string;
  englishAddress: string;
  addressElements: {
    type: string[];
    loadName: string;
    shortName: string;
    code: string;
  }[];
  x: string;
  y: string;
  distance: number;
};

export const searchAddress = async (
  query: string,
  count = 30
): Promise<Address[]> => {
  try {
    if (typeof CLIENT_ID !== "string" || typeof CLIENT_SECRET !== "string") {
      throw new Error("Enviromnet Error");
    }

    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${query}&count=${count}`;

    const response = await fetch(url, {
      headers: {
        "x-ncp-apigw-api-key-id": CLIENT_ID,
        "x-ncp-apigw-api-key": CLIENT_SECRET,
        Accept: "application/json",
      },
    });

    const data = (await response.json()) as Response;

    if (data.status !== "OK") {
      console.error(data.errorMessage);
      return [];
    }

    return data.addresses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getDistance = (
  pos1: { latitude: number; longitude: number },
  pos2: { latitude: number; longitude: number }
) => {
  const dx = pos1.longitude - pos2.longitude;
  const dy = pos1.latitude - pos2.latitude;
  return Math.sqrt(dx * dx + dy * dy);
};
