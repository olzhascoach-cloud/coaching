import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { books } from "@/data/books";
import Image from "next/image";

export default function Books() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-ink)]">
      <Container>
        <SectionHeading
          kicker="Книги"
          title="Продолжение опыта&nbsp;на бумаге"
          subtitle="Не учебники. Честные книги — об ошибках, о бизнесе и о жизни."
        />
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex gap-6 p-8 border border-[rgba(183,162,122,0.1)] bg-[var(--color-ink-2)] hover:border-[rgba(183,162,122,0.25)] transition-colors"
            >
              {/* Book cover placeholder */}
              <div className="flex-shrink-0 w-24 h-36 bg-[var(--color-ink-3)] flex items-center justify-center">
                {book.image ? (
                  <Image
                    src={book.image}
                    alt={book.title}
                    width={96}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[var(--color-muted-2)] text-[10px] text-center px-2">
                    Обложка
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="font-serif text-xl font-light text-white leading-snug">
                  {book.title}
                </h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                  {book.idea}
                </p>
                <p className="text-[12px] text-[var(--color-bronze)]">{book.audience}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
