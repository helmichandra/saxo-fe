import { NextApiRequest, NextApiResponse } from "next";
import coinLogo from "../../lib/coinLogo.json";

interface CoinLogo {
  id: number;
  icon: string;
  symbol: string;
}

interface ConversionData {
  conversions: {
    USD: {
      [currency: string]: number;
    };
  };
}

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      volume_24h: number;
      circulating_supply: number;
    };
  };
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const base_url =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  const api_key = process.env.NEXT_PUBLIC_CRYPTO_KEY || "";

  if (!api_key) {
    console.error("Missing API key for CoinMarketCap");
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {
    const response = await fetch(base_url, {
      method: "GET",
      next: { revalidate: 10 },
      cache: "no-store",
      headers: {
        "X-CMC_PRO_API_KEY": api_key,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cryptocurrency data: ${response.status}`);
    }

    const currencyJsonUrl =
      "https://cdn.jsdelivr.net/gh/prebid/currency-file@1/latest.json";

    const conversionResponse = await fetch(currencyJsonUrl);
    if (!conversionResponse.ok) {
      throw new Error(
        `Failed to fetch conversion rates: ${conversionResponse.status}`
      );
    }

    const conversionData: ConversionData = await conversionResponse.json();
    const conversions = conversionData.conversions;

    const targetCurrency = "IDR";

    const coinLogoLookup = Object.fromEntries(
      coinLogo.map((item: CoinLogo) => [String(item.id), item])
    );

    const data = await response.json();

    const mergedData = data.data.map((crypto: CryptoData) => {
      const usdPrice = crypto.quote.USD;
      const conversionRate = conversions.USD?.[targetCurrency] || 1;

      const convertedQuote = {
        price: usdPrice.price * conversionRate,
        percent_change_24h: Number(usdPrice.percent_change_24h.toFixed(2)),
        percent_change_7d: Number(usdPrice.percent_change_7d.toFixed(2)),
        market_cap: usdPrice.market_cap * conversionRate,
        volume_24h: usdPrice.volume_24h * conversionRate,
        circulating_supply: usdPrice.circulating_supply,
      };

      const logoItem = coinLogoLookup[String(crypto.id)];

      return {
        ...crypto,
        logoUrl: logoItem?.icon || null,
        priceInTargetCurrency: convertedQuote,
        targetCurrency,
      };
    });

    res.status(200).json({ data: mergedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
