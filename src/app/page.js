import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Categories from "@/components/home/Categories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CTA from "@/components/home/CTA";

import Testimonials from "@/components/testimonials/Testimonials";
import { query } from "@/db/query";

export default async function HomePage() {
  let approvedTestimonials = [];
  try {
    approvedTestimonials = await query(
      'SELECT * FROM "Testimonial" WHERE "status" = $1 ORDER BY "createdAt" DESC',
      ["approved"],
    );
  } catch (error) {
    console.error("Failed to query testimonials:", error);
  }

  return (
    <>
      <Hero />
      <Services />
      <Categories />
      <WhyChooseUs />
      <CTA />
      <Testimonials testimonials={approvedTestimonials} />
    </>
  );
}
