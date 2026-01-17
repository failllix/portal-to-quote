import Checkout from "@/app/components/checkout";
import QuoteSummary from "@/app/components/quote-summary";
import StartNewQuoteButton from "@/app/components/start-new-quote-button";
import { stripe } from "@/app/utils/stripe";
import { apiClient } from "@/shared/client";
import Heading1 from "../../components/heading1";

export interface Material {
  name: string;
  code: string;
  price: number;
  leadTimeDays: number;
  properties: string[];
}

export type GetGeometryResult = ReturnType<typeof apiClient.getGeometryResult>;

export default async function MaterialSelectionPage({
  params,
}: {
  params: { quoteId: string };
}) {
  const { quoteId } = await params;

  const quoteResponse = await apiClient.getQuote({ params: { id: quoteId } });

  if (quoteResponse.status !== 200) {
    throw new Error(quoteResponse.body.message);
  }

  const quote = quoteResponse.body;

  if (quote.status !== "ready") {
    throw new Error(
      "Cannot create order for quote, which is not in 'ready' state",
    );
  }

  const materialsResponse = await apiClient.getMaterials();

  const materials = materialsResponse.body;
  const filteredMaterial = materials.filter(
    (material) => material.code === quote.materialId,
  );

  const material = filteredMaterial[0];

  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: quote.totalPrice * 100,
    currency: "eur",
  });

  if (clientSecret === null) {
    throw new Error("Could not begin payment transaction.");
  }

  return (
    <main className="px-12 mx-auto max-w-300 pb-12">
      <Heading1>Checkout</Heading1>
      {material ? (
        <>
          <QuoteSummary
            quote={quote}
            expectedDeliveryDate={
              new Date(Date.now() + material.leadTimeDays * 24 * 60 * 60 * 1000)
            }
          ></QuoteSummary>
          <Checkout quote={quote} clientSecret={clientSecret}></Checkout>
        </>
      ) : (
        <MissingMaterialMessage
          materialName={quote.materialName}
          fileId={quote.fileId}
        ></MissingMaterialMessage>
      )}
    </main>
  );
}

function MissingMaterialMessage({
  materialName,
  fileId,
}: {
  materialName: string;
  fileId: string;
}) {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <p>Looks like your select material '{materialName}' was discontinued.</p>
      <StartNewQuoteButton className="w-fit" fileId={fileId}>
        Select another
      </StartNewQuoteButton>
    </div>
  );
}
