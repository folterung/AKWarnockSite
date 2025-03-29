import Image from 'next/image';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { books } from '../../data/books';
import { GetStaticProps, GetStaticPaths } from 'next';

interface BookPageProps {
  book: typeof books[0];
}

export default function BookPage({ book }: BookPageProps) {
  return (
    <>
      <Header />
      <Head>
        <title>{`${book.title} | A.K. Warnock`}</title>
        <meta name="description" content={book.description} />
      </Head>

      <div className="pt-24 text-center py-8">
        <h1 className="text-4xl font-bold">{book.title}</h1>
      </div>

      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image
          src={book.coverImage}
          alt={`${book.title} Book Cover`}
          fill
          className="object-contain"
          priority
        />
      </div>
      <section className="text-center mt-8 mb-16">
        <a
          href={book.amazonLink}
          className="btn btn-primary text-lg px-8 py-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          Order Now
        </a>
      </section>
      
      <div className="max-w-3xl mx-auto px-4">
        <section className="mb-8">
          <h2 className="section-title">Synopsis</h2>
          <p className="text-xl whitespace-pre-line">
            {book.synopsis}
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = books.map((book) => ({
    params: { id: book.id },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const book = books.find((b) => b.id === params?.id);

  if (!book) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      book,
    },
  };
}; 