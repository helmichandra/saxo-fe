import { NextApiRequest, NextApiResponse } from "next";
import { CoinInfoResponse, CryptocurrencyData } from "@/models/Interface";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const base_url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`;
  const info_url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info`;
  const api_key = process.env.NEXT_PUBLIC_CRYPTO_KEY || "";
  const targetCurrency = "IDR";

  const { slug } = req.query;

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

    
    const matchingCoin = data.data.find(
      (crypto: CryptocurrencyData) => crypto.slug === slug
    );

    if (!matchingCoin) {
      return res.status(404).json({ error: "Coin not found" });
    }

    
    const infoResponse = await fetch(`${info_url}?id=${matchingCoin.id}`, {
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

    
    const coinInfo = infoData.data[String(matchingCoin.id)];

    
    const convertedQuote = {
      price: matchingCoin.quote.USD.price * conversionRate,
      percent_change_24h: Number(
        matchingCoin.quote.USD.percent_change_24h.toFixed(2)
      ).toLocaleString(),
      percent_change_7d: Number(
        matchingCoin.quote.USD.percent_change_7d.toFixed(2)
      ).toLocaleString(),
      percent_change_30d: Number(
        matchingCoin.quote.USD.percent_change_30d.toFixed(2)
      ).toLocaleString(),
      percent_change_60d: Number(
        matchingCoin.quote.USD.percent_change_60d.toFixed(2)
      ).toLocaleString(),
      percent_change_90d: Number(
        matchingCoin.quote.USD.percent_change_90d.toFixed(2)
      ).toLocaleString(),
      market_cap: matchingCoin.quote.USD.market_cap * conversionRate,
      volume_24h: matchingCoin.quote.USD.volume_24h * conversionRate,
      fully_diluted_market_cap:
        matchingCoin.quote.USD.fully_diluted_market_cap * conversionRate,
    };

    const infoCoin = {
      website: coinInfo.urls.website,
      technical_doc: coinInfo.urls.technical_doc,
      twitter: coinInfo.urls.twitter,
      reddit: coinInfo.urls.reddit,
      message_board: coinInfo.urls.message_board,
      announcement: coinInfo.urls.announcement,
      chat: coinInfo.urls.chat,
      explorer: coinInfo.urls.explorer,
      source_code: coinInfo.urls.source_code,
    };

    const mergedData = {
      ...matchingCoin,
      logoUrl: coinInfo?.logo || null,
      infoCoin: infoCoin,
      priceInTargetCurrency: convertedQuote,
      targetCurrency,
    };

    res.status(200).json({ data: mergedData });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
