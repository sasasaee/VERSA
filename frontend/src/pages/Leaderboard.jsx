import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import Confetti from 'react-confetti';

// Simple hook so we don't need to install react-use
function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
}

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState('');
    const { width, height } = useWindowDimensions();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLeaderboard();
        checkStreak();
    }, [navigate, token]);

    const checkStreak = async () => {
        try {
            const cleanToken = token.replace(/^"|"$/g, '');
            const res = await axios.get(`http://localhost:5000/api/contests/check-streak`, {
                headers: { 'x-auth-token': cleanToken }
            });
            if (res.data.upgraded) {
                setUpgradeMessage(res.data.newRank);
                setShowConfetti(true);
            }
        } catch (err) {
            console.error('Error checking streak:', err);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const cleanToken = token.replace(/^"|"$/g, '');
            const res = await axios.get(`http://localhost:5000/api/contests/leaderboard`, {
                headers: { 'x-auth-token': cleanToken }
            });
            setLeaderboard(res.data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto pb-20 relative">
            {showConfetti && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                        numberOfPieces={800}
                        gravity={0.15}
                    />

                    <div className="bg-skin-card p-10 rounded-3xl shadow-2xl border-4 border-[#FFD700] max-w-lg mx-auto text-center transform animate-modal-pop pointer-events-auto relative overflow-hidden backdrop-blur-md">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/20 to-transparent pointer-events-none"></div>

                        <div className="text-6xl mb-6 relative z-10 animate-bounce">🎊</div>
                        <h2 className="text-3xl font-serif font-black text-skin-text mb-4 relative z-10">Legendary Streak!</h2>
                        <p className="text-lg text-skin-muted mb-8 relative z-10">
                            You placed 1st in 3 consecutive contests!<br />
                            As a reward for your incredible storytelling, your title has officially been upgraded to <span className="font-black text-[#FFD700] uppercase tracking-wider glow-text">Author</span>!
                        </p>
                        <button
                            onClick={() => setShowConfetti(false)}
                            className="px-8 py-3 bg-skin-secondary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest text-sm relative z-10"
                        >
                            Claim Title
                        </button>
                    </div>
                </div>
            )}

            <Navbar />

            <div className="pt-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif font-bold text-skin-text mb-4 drop-shadow-sm">
                        Leaderboard
                    </h1>
                    <p className="text-skin-muted text-lg max-w-2xl mx-auto">
                        Celebrating our top storytellers and contributors.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-40">
                        <div className="animate-spin w-12 h-12 border-4 border-skin-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <div className="bg-skin-card rounded-[2.5rem] border border-skin-search-border shadow-2xl overflow-hidden animate-fade-in relative">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-skin-primary/40 to-transparent"></div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-skin-primary/5">
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted">Global Rank</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted">User & Title</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-center">Contest Points</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-center">Story Points</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-right">Global Influence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-skin-search-border">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-10 py-32 text-center text-skin-muted italic font-serif text-xl opacity-60">
                                                No storytellers have earned points yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((entry) => (
                                            <tr key={entry.user._id} className="hover:bg-skin-primary/5 transition-all duration-300 group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-2xl font-black italic ${entry.rank === 1 ? 'text-[#FFD700]' :
                                                            entry.rank === 2 ? 'text-[#C0C0C0]' :
                                                                entry.rank === 3 ? 'text-[#CD7F32]' :
                                                                    'text-skin-muted opacity-40'
                                                            }`}>
                                                            #{entry.rank}
                                                        </span>
                                                        {entry.rank <= 3 && (
                                                            <span className="text-xl">
                                                                {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full p-0.5 overflow-hidden ring-2 transition-all duration-300 ${entry.rank === 1 ? 'ring-[#FFD700]' :
                                                            entry.rank === 2 ? 'ring-[#C0C0C0]' :
                                                                entry.rank === 3 ? 'ring-[#CD7F32]' :
                                                                    'ring-skin-search-border group-hover:ring-skin-secondary'
                                                                }`}>
                                                            {entry.user.profilePicture ? (
                                                                <img src={entry.user.profilePicture} className="w-full h-full object-cover rounded-full" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-skin-primary font-black rounded-full text-lg">
                                                                    {entry.user.username[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div
                                                                className="font-black text-skin-text group-hover:text-skin-secondary transition-colors cursor-pointer text-lg leading-tight"
                                                                onClick={() => navigate(`/profile/${entry.user._id}`)}
                                                            >
                                                                {entry.user.username}
                                                            </div>
                                                            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-skin-primary/10 ${entry.user.rank === 'author' ? 'bg-[#FFD700]/10 text-[#B8860B] border-[#FFD700]/20' :
                                                                    entry.user.rank === 'master' ? 'bg-skin-primary/20 text-skin-primary' :
                                                                        'bg-skin-muted/10 text-skin-muted'
                                                                }`}>
                                                                {entry.user.rank || 'reader'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <span className="font-serif font-black text-xl text-skin-text">{entry.contestUpvotes}</span>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <span className="font-serif font-black text-xl text-skin-text">{entry.storyUpvotes}</span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <span className={`text-3xl font-serif font-black drop-shadow-sm ${entry.rank === 1 ? 'text-skin-primary scale-110 inline-block' : 'text-skin-text'
                                                        }`}>
                                                        {entry.finalScore}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
