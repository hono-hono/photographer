import { Hero } from "@/components/home/Hero";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { ProfilePreview } from "@/components/home/ProfilePreview";
import { ContactPreview } from "@/components/home/ContactPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedGallery />
      <ProfilePreview />
      <ContactPreview />
    </>
  );
}
