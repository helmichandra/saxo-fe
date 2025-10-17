import { NextApiRequest, NextApiResponse } from "next";
import { CoinInfoResponse, CryptocurrencyData } from "@/models/Interface";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const base_url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  const info_url = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info";
  const api_key = process.env.NEXT_PUBLIC_CRYPTO_KEY || "";
  const targetCurrency = "IDR";

  try {
    const response = await fetch(base_url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": api_key,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch cryptocurrency listings: ${response.status}`
      );
    }

    const data = await response.json();
    const ids = data.data
      .map((crypto: CryptocurrencyData) => crypto.id)
      .join(",");

    const infoResponse = await fetch(`${info_url}?id=${ids}`, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": api_key,
        "Content-Type": "application/json",
      },
    });

    if (!infoResponse.ok) {
      throw new Error(
        `Failed to fetch cryptocurrency info: ${infoResponse.status}`
      );
    }

    const infoData: CoinInfoResponse = await infoResponse.json();

    const currencyJsonUrl =
      "https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json";
    const conversionResponse = await fetch(currencyJsonUrl);

    if (!conversionResponse.ok) {
      throw new Error(
        `Failed to fetch currency conversion data: ${conversionResponse.status}`
      );
    }

    const conversionData = await conversionResponse.json();
    const conversions = conversionData.conversions;

    
    const conversionRate = conversions.USD[targetCurrency] || 1;

    
    const mergedData = data.data.map((crypto: CryptocurrencyData) => {
      const coinInfo = infoData.data[String(crypto.id)];

      
      const convertedQuote = {
        price: crypto.quote.USD.price * conversionRate,
        percent_change_24h: Number(
          crypto.quote.USD.percent_change_24h.toFixed(2)
        ).toLocaleString(),
        percent_change_7d: Number(
          crypto.quote.USD.percent_change_7d.toFixed(2)
        ).toLocaleString(),
        market_cap: crypto.quote.USD.market_cap * conversionRate,
        volume_24h: crypto.quote.USD.volume_24h * conversionRate,
      };

      return {
        ...crypto,
        logoUrl: coinInfo?.logo || null,
        priceInTargetCurrency: convertedQuote,
        targetCurrency,
      };
    });

    res.status(200).json({ data: mergedData });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
