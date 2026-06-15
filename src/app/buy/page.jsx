import BuyHero from "@/components/buy/BuyHero";
import ProductGrid from "@/components/buy/ProductGrid";
import WhyBuyUs from "@/components/buy/WhyBuyUs";
import BuyFAQ from "@/components/buy/BuyFAQ";

export const metadata = {
  title: "Buy Equipment | Friendly Camera Rentals",
  description: "Buy genuine cameras, lenses, drones and accessories.",
};

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <BuyHero />

      <section id="products">
        <ProductGrid />
      </section>

      <WhyBuyUs />

      <BuyFAQ />
    </main>
  );
}
