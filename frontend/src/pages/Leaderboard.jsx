import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchLeaderboard();
    }, [navigate, token]);

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
        <div className="min-h-screen pt-10 px-4 max-w-7xl mx-auto pb-20">
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
                    <div className="bg-skin-card rounded-[2.5rem] border border-skin-primary/10 shadow-2xl overflow-hidden animate-fade-in relative">
                        {/* Decorative glow */}
                        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-skin-primary/40 to-transparent"></div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-skin-primary/5">
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted">Rank</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted">User</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted">Story Segment</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-center">Contest Upvotes</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-center">Bonus</th>
                                        <th className="px-10 py-6 text-sm font-black uppercase tracking-widest text-skin-muted text-right">Final Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-skin-primary/5">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-10 py-32 text-center text-skin-muted italic font-serif text-xl opacity-60">
                                                No rankings recorded for the current contest.
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
                                                                    'ring-transparent group-hover:ring-skin-primary/30'
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
                                                            {entry.rank === 1 && <span className="text-[10px] uppercase tracking-tighter font-bold text-[#B8860B] bg-[#FFD700]/10 px-2 py-0.5 rounded-full border border-[#FFD700]/20">Grand Winner</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-skin-text/70 font-serif italic truncate block max-w-[250px] leading-relaxed">
                                                        "{entry.title || 'Untitled Submission'}"
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <span className="font-serif font-black text-xl text-skin-text">{entry.contestUpvotes}</span>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    {entry.bonus > 0 ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-skin-primary/10 text-skin-primary border border-skin-primary/20 shadow-sm">
                                                                +{entry.bonus} BONUS
                                                            </span>
                                                            <span className="text-[8px] mt-1 text-skin-muted font-bold opacity-60">High Engagement</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-skin-muted opacity-20">—</span>
                                                    )}
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
