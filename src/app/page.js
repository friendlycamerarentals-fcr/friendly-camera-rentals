import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Categories from "@/components/home/Categories";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CTA from "@/components/home/CTA";

import Testimonials from "@/components/testimonials/Testimonials";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  let approvedTestimonials = [];
  try {
    approvedTestimonials = await prisma.testimonial.findMany({
      where: {
        status: "approved",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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
