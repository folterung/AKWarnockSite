import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from './layout/Header'
import Footer from './layout/Footer'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

interface HomeProps {
  homeInfo: {
    hero: {
      title: string;
      subtitle: string;
      cta: {
        text: string;
        link: string;
      };
    };
    featuredBook: {
      title: string;
      image: string;
      alt: string;
      link: string;
      cta: {
        text: string;
        link: string;
      };
    };
    newsletter: {
      title: string;
      subtitle: string;
      form: {
        placeholder: string;
        submitButton: string;
        loadingText: string;
      };
    };
  };
}

export default function Home({ homeInfo }: HomeProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.unsubscribed === 'true') {
      toast.success('Successfully unsubscribed from the newsletter.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      router.replace('/', undefined, { shallow: true });
    }
    if (router.query.contactSent === 'true') {
      toast.success('Your message has been sent successfully! We will get back to you soon.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
      router.replace('/', undefined, { shallow: true });
    }
  }, [router, router.query]);

  const handleSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      const response = await fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Successfully subscribed!', { position: 'bottom-right', autoClose: 5000 });
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.', { position: 'bottom-right', autoClose: 5000 });
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.', { position: 'bottom-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white bg-cover bg-center" style={{ backgroundImage: 'url(/images/elemental-backdrop.jpg)', maxWidth: '1920px', margin: '0 auto' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="bg-black/70 p-8 rounded-lg max-w-3xl mx-auto">
              <div className="space-y-8">
                <h1 className="hero-text text-white">
                  {homeInfo.hero.title}
                </h1>
                <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
                  {homeInfo.hero.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={homeInfo.hero.cta.link}
                    className="btn btn-primary text-lg px-8 py-4"
                  >
                    {homeInfo.hero.cta.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Book Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{homeInfo.featuredBook.title}</h2>
          <div className="max-w-3xl mx-auto">
            <div className="group">
              <Link href={homeInfo.featuredBook.link}>
                <img
                  src={homeInfo.featuredBook.image}
                  alt={homeInfo.featuredBook.alt}
                  className="w-full h-[600px] object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="mt-8 text-center">
                <div className="mt-6">
                  <Link
                    href={homeInfo.featuredBook.cta.link}
                    className="btn btn-primary text-lg px-8 py-4"
                  >
                    {homeInfo.featuredBook.cta.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">{homeInfo.newsletter.title}</h2>
          <p className="text-lg text-gray-600 mb-8">
            {homeInfo.newsletter.subtitle}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubscription}>
            {message && <p className="text-center text-green-500 mb-4">{message}</p>}
            <input
              type="email"
              name="email"
              placeholder={homeInfo.newsletter.form.placeholder}
              className="input flex-grow"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? homeInfo.newsletter.form.loadingText : homeInfo.newsletter.form.submitButton}
            </button>
          </form>
        </div>
      </section>

      <Footer />
      <ToastContainer />
    </div>
  )
} 