// src/pages/public/Legal.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';

const Legal = () => {
  const { page } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/cyber/legal/${page || 'terms'}`);
        setContent(res.data.content || 'No content available.');
      } catch {
        setContent('Content not available.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const title = page === 'privacy' ? 'Privacy Policy' : page === 'refund' ? 'Refund Policy' : 'Terms & Conditions';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{title}</h1>
      {loading ? <Spinner /> : <div className="prose dark:prose-invert max-w-none text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: content }} />}
    </div>
  );
};

export default Legal;