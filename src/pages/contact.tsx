import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { contactInfo } from '../data/contact';
import { GetStaticProps } from 'next';
import { toast, ToastContainer } from 'react-toastify';
import { validateEmail, validatePhoneNumber, formatPhoneNumber } from '../utils/validation';

interface ContactPageProps {
  contactInfo: typeof contactInfo;
}

export default function Contact({ contactInfo }: ContactPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredMethod: 'email',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const validateForm = () => {
    const newErrors = {
      name: '',
      phone: '',
      email: '',
      message: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: formatPhoneNumber(formData.phone),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Reset form and redirect to home page
      setFormData({
        name: '',
        phone: '',
        email: '',
        preferredMethod: 'email',
        message: '',
      });
      setCharCount(0);
      setErrors({
        name: '',
        phone: '',
        email: '',
        message: '',
      });
      router.replace('/?contactSent=true');
    } catch (error) {
      // Show error message and keep form data
      toast.error('Failed to send message. Please try again.', {
        position: 'bottom-right',
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'message') {
      if (value.length <= 1000) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        setCharCount(value.length);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <>
      <Head>
        <title>{contactInfo.title}</title>
        <meta name="description" content={contactInfo.description} />
      </Head>

      <div className="min-h-screen">
        <Header />
        
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">{contactInfo.form.title}</h1>
            <p className="text-gray-600 text-center mb-8">{contactInfo.form.subtitle}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {contactInfo.form.fields.name.label}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {contactInfo.form.fields.phone.label}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="(123) 456-7890"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {contactInfo.form.fields.email.label}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contactInfo.form.fields.preferredMethod.label}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredMethod"
                      value="phone"
                      checked={formData.preferredMethod === 'phone'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Phone Call
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredMethod"
                      value="text"
                      checked={formData.preferredMethod === 'text'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Text Message
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredMethod"
                      value="email"
                      checked={formData.preferredMethod === 'email'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Email
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  {contactInfo.form.fields.message.label}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={1000}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us what you'd like to discuss..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    {charCount}/1000 characters
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? contactInfo.form.loadingText : contactInfo.form.submitButton}
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
      contactInfo,
    },
  };
}; 