import Link from 'next/link';
import Head from 'next/head';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Image from 'next/image';

export default function Games() {
  return (
    <>
      <Header />
      <Head>
        <title>Games | A.K. Warnock</title>
        <meta name="description" content="Play games by A.K. Warnock" />
      </Head>

      <div className="pt-24 px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Games</h1>
        
        <div className="space-y-6">
          <Link 
            href="/games/axiomata" 
            className="block border border-gray-300 rounded-lg p-6 hover:bg-gray-100 transition group"
          >
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg overflow-hidden">
                  <Image
                    src="/images/games/axiomata.png"
                    alt="Axiomata game"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  Axiomata
                </h2>
                <p className="text-gray-600">
                  A daily logic puzzle game. Solve the grid by satisfying all constraints!
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="text-3xl font-bold text-center mb-6">Kids&apos; Creations</h2>
          <div className="space-y-6">
            <a 
              href="https://scratch.mit.edu/users/RainbowDash0109/" 
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-300 rounded-lg p-6 hover:bg-gray-100 transition group"
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-24 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/RaidenPFP.png"
                      alt="RainbowDash0109 profile"
                      width={128}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    RainbowDash0109
                  </h3>
                  <p className="text-gray-600">
                    Check out what our kids have made through Scratch!
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a 
              href="https://scratch.mit.edu/users/ScratchMaster08130/" 
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-300 rounded-lg p-6 hover:bg-gray-100 transition group"
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-24 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/RagnarPFP.png"
                      alt="ScratchMaster08130 profile"
                      width={128}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    ScratchMaster08130
                  </h3>
                  <p className="text-gray-600">
                    Check out what our kids have made through Scratch!
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </section>
      </div>
      <Footer fixed />
    </>
  );
}

