import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="Page Not Found" />
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 text-center selection:bg-zinc-200 dark:selection:bg-zinc-800">
        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-sm">
          <SearchX className="w-12 h-12" />
        </div>

        <h1 className="text-8xl font-black text-foreground mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
          Oops! We couldn't find the page you are looking for. It might have been removed, renamed, or did not exist in the first place.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-card text-card-foreground font-bold rounded-xl transition-all shadow-sm border hover:bg-accent hover:text-accent-foreground active:scale-95"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            Return Home
          </button>
        </div>
      </div>
    </>
  );
}
