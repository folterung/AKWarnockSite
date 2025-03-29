import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { unsubscribeInfo } from '../data/unsubscribe';
import { GetStaticProps } from 'next';
import { toast, ToastContainer } from 'react-toastify';

interface UnsubscribePageProps {
  unsubscribeInfo: typeof unsubscribeInfo;
}

export default function Unsubscribe({ unsubscribeInfo }: UnsubscribePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check for email in query parameters
    if (router.query.email && typeof router.query.email === 'string') {
      setEmail(router.query.email);
      unsubscribeButtonRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, [router.query.email]);

  const handleUnsubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      const response = await fetch('/.netlify/functions/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success('Successfully unsubscribed from the newsletter.', {
          position: 'bottom-right',
          autoClose: 5000,
        });
        router.push('/?unsubscribed=true');
      } else {
        throw new Error(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      toast.error('Failed to unsubscribe. Please try again.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{unsubscribeInfo.title}</title>
        <meta name="description" content={unsubscribeInfo.description} />
      </Head>

      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">{unsubscribeInfo.form.title}</h1>
            <p className="text-gray-600 text-center mb-8">
              {unsubscribeInfo.form.subtitle}
              {!router.query.email && (
                <>
                  <br />
                  <span> Enter your email address below to unsubscribe from our newsletter.</span>
                </>
              )}
            </p>
            <form onSubmit={handleUnsubscribe} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {unsubscribeInfo.form.emailField.label}
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={unsubscribeInfo.form.emailField.placeholder}
                  required={unsubscribeInfo.form.emailField.required}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                ref={unsubscribeButtonRef}
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary"
              >
                {loading ? unsubscribeInfo.form.loadingText : unsubscribeInfo.form.submitButton}
              </button>
            </form>
          </div>
        </main>
        <Footer />
        <ToastContainer position="bottom-right" autoClose={5000} />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      unsubscribeInfo,
    },
  };
}; 