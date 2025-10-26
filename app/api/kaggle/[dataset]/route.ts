// app/api/kaggle/[dataset]/route.ts
import axios from "axios";
import { NextResponse } from "next/server";

// Cache en mémoire côté serveur
const datasetCache: Record<string, any> = {};

export async function GET(
  req: Request,
  { params }: { params: { dataset: string } }
) {
  try {
    let { dataset } = await params 
    dataset = decodeURIComponent(dataset)

    console.log("📦 Fetching Kaggle dataset:", dataset);

    // Vérifier le cache
    if (datasetCache[dataset]) {
      console.log("📦 Returning cached dataset");
      return NextResponse.json(datasetCache[dataset]);
    }

    const { KAGGLE_USERNAME, KAGGLE_KEY } = process.env;
    if (!KAGGLE_USERNAME || !KAGGLE_KEY) {
      return NextResponse.json(
        { error: "Kaggle API credentials missing" },
        { status: 500 }
      );
    }

    const [owner, slug] = dataset.split("/");

    const res = await axios.get(
      `https://www.kaggle.com/api/v1/datasets/view/${owner}/${slug}`,
      { auth: { username: KAGGLE_USERNAME, password: KAGGLE_KEY } }
    );

    const data = res.data;

    const metadata = {
      title: data?.title ?? slug,
      subtitle: data?.subtitle,
      creator: data?.ownerName ?? owner,
      thumbnail: data?.thumbnailImageUrl,
      currentVersionNumber: data?.currentVersionNumber,
      downloadCount: data?.downloadCount,
      viewCount: data?.viewCount,
      voteCount: data?.voteCount,
      lastUpdated: data?.lastUpdated,
      isPrivate: data?.isPrivate ?? false,
      url: `https://www.kaggle.com/datasets/${owner}/${slug}`,
    };

    // Stocker dans le cache
    datasetCache[dataset] = metadata;

    return NextResponse.json(metadata);
  } catch (err: any) {
    console.error("❌ Kaggle fetch error:", err?.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to fetch dataset metadata from Kaggle" },
      { status: 500 }
    );
  }
}
