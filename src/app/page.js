import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Categories from "@/components/home/Categories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Categories />
      <WhyChooseUs />
      <CTA />
    </>
  );
}