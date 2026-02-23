import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContestSidebar = () => {
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/contests/current');
        if (res.ok) {
          const data = await res.json();
          setContest(data);
        }
      } catch (err) {
        console.error("Error fetching contest:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, []);

  if (loading) return (
    <div className="hidden lg:block w-full sticky top-24 h-fit">
      <div className="bg-skin-card p-6 rounded-2xl shadow-lg border-l-4 border-skin-secondary animate-pulse">
        <div className="h-6 bg-skin-muted/20 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-skin-muted/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-skin-muted/20 rounded w-5/6 mb-4"></div>
        <div className="h-10 bg-skin-muted/20 rounded w-full"></div>
      </div>
    </div>
  );

  if (!contest) return null;

  const isExpired = new Date() > new Date(contest.deadline);

  return (
    <div className="hidden lg:block w-full sticky top-24 h-fit">
      <div className="bg-skin-card p-6 rounded-2xl shadow-lg border-l-4 border-skin-secondary">
        <h3 className="font-serif font-bold text-xl text-skin-primary mb-2 flex items-center gap-2">
          🏆 Weekly Prompt
        </h3>
        <h4 className="font-serif font-bold text-lg text-skin-secondary mb-3">
          {contest.title}
        </h4>
        <p className="text-skin-text text-sm mb-4 leading-relaxed line-clamp-3 italic opacity-80">
          "{contest.description}"
        </p>
        <div className="flex flex-col gap-1 mb-4">
          <div className="text-[10px] font-black text-skin-muted uppercase tracking-[0.2em]">
            Deadline
          </div>
          <div className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-skin-primary'}`}>
            {new Date(contest.deadline).toLocaleDateString()} at {new Date(contest.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <button
          onClick={() => navigate('/contest')}
          className="w-full py-3 bg-skin-secondary hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-md text-sm uppercase tracking-wider"
        >
          {isExpired ? 'View Contest' : 'Participate Now'}
        </button>
      </div>
    </div>
  );
};

export default ContestSidebar;