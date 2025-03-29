import Link from 'next/link';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Image from 'next/image';
import { books } from '../../data/books';
import { GetStaticProps } from 'next';

interface BooksPageProps {
  books: typeof books;
}

export default function Books({ books }: BooksPageProps) {
  return (
    <>
      <Header />
      <Head>
        <title>Books | A.K. Warnock</title>
        <meta name="description" content="Explore the books by A.K. Warnock" />
      </Head>

      <div className="pt-24 px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Books</h1>
        <ul className="space-y-4">
          {books.map((book) => (
            <li key={book.id} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition flex items-center">
              <Image
                src={book.coverImage}
                alt={`${book.title} Book Cover`}
                width={50}
                height={75}
                className="mr-4"
              />
              <Link href={`/books/${book.id}`} className="text-2xl text-blue-600 hover:underline">
                {book.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Footer fixed />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      books,
    },
  };
}; 