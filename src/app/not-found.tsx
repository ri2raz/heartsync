import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Container className="py-28 text-center">
      <p className="font-serif text-8xl italic text-rose">404</p>
      <h1 className="mt-4 font-serif text-4xl">This page wandered off.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">But we&apos;re still here if you want to talk.</p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">Go home</ButtonLink>
        <ButtonLink href="/listeners" variant="secondary">
          Find a listener
        </ButtonLink>
      </div>
    </Container>
  );
}
