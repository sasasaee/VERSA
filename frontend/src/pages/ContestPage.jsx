import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useNotification } from '../context/NotificationContext';
import SubmissionModal from '../components/SubmissionModal';

const ContestPage = () => {
    const [contest, setContest] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const { showNotification } = useNotification();
    const [votingInProgress, setVotingInProgress] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const contestRes = await fetch('http://localhost:5000/api/contests/current');
                if (contestRes.ok) {
                    const contestData = await contestRes.json();
                    setContest(contestData);

                    const submissionRes = await fetch(`http://localhost:5000/api/contests/my-submission/${contestData._id}`, {
                        headers: { 'x-auth-token': token }
                    });
                    if (submissionRes.ok) {
                        const submissionData = await submissionRes.json();
                        setSubmission(submissionData);
                    }

                    const subsRes = await fetch(`http://localhost:5000/api/contests/${contestData._id}/submissions`);
                    if (subsRes.ok) {
                        const subsData = await subsRes.json();
                        setSubmissions(subsData);
                    }
                }
            } catch (err) {
                console.error("Error fetching contest data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, navigate]);

    const handleSubmit = async () => {
        if (!content.trim()) {
            showNotification('Story cannot be empty', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/contests/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ contestId: contest._id, content })
            });

            if (res.ok) {
                const data = await res.json();
                setSubmission(data);
                // Refresh submissions list to include the new one
                const subsRes = await fetch(`http://localhost:5000/api/contests/${contest._id}/submissions`);
                if (subsRes.ok) {
                    const subsData = await subsRes.json();
                    setSubmissions(subsData);
                }
                showNotification('Story submitted successfully! Good luck!', 'success');
            } else {
                const data = await res.json();
                showNotification(data.msg || 'Submission failed', 'error');
            }
        } catch (err) {
            console.error("Submission error:", err);
            showNotification('Error submitting story', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async (submissionId) => {
        if (!token) {
            navigate('/login');
            return;
        }

        setVotingInProgress(submissionId);
        try {
            const res = await fetch(`http://localhost:5000/api/contests/vote/${submissionId}`, {
                method: 'POST',
                headers: {
                    'x-auth-token': token
                }
            });

            if (res.ok) {
                const data = await res.json();
                // Update submissions list with new vote count/status
                setSubmissions(prev => prev.map(sub =>
                    sub._id === submissionId ? { ...sub, votes: data.votes } : sub
                ));
                showNotification(data.hasVoted ? 'Vote added!' : 'Vote removed!', 'success');
            } else {
                const data = await res.json();
                showNotification(data.msg || 'Voting failed', 'error');
            }
        } catch (err) {
            console.error("Voting error:", err);
            showNotification('Error processing vote', 'error');
        } finally {
            setVotingInProgress(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-skin-base">
            <div className="animate-spin w-12 h-12 border-4 border-skin-primary border-t-transparent rounded-full"></div>
        </div>
    );

    if (!contest) return (
        <div className="min-h-screen bg-skin-base flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-serif font-bold text-skin-primary mb-4 text-center">No Active Contest</h1>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-skin-secondary text-white rounded-full font-bold">Back to Dashboard</button>
        </div>
    );

    const now = new Date();
    const isExpired = now > new Date(contest.deadline);
    const isVotingPeriod = isExpired && now < new Date(contest.votingDeadline);
    const votingEnded = now > new Date(contest.votingDeadline);

    const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;
    const getWordCount = (str) => {
        if (!str) return 0;
        return str.trim().split(/\s+/).filter(Boolean).length;
    };
    const wordCount = getWordCount(content);

    return (
        <div className="min-h-screen bg-skin-base pt-10 px-4 max-w-5xl mx-auto pb-20">
            {/* Mini Navbar style back button */}
            <button
                onClick={() => navigate('/')}
                className="mb-8 text-2xl font-serif font-black text-skin-primary tracking-tighter hover:text-skin-secondary transition-colors"
            >
                ← VERSA
            </button>

            <div className="bg-skin-card rounded-3xl shadow-2xl overflow-hidden border border-skin-primary/5">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-skin-primary/10 to-skin-secondary/5 p-8 md:p-12 border-b border-skin-primary/10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-skin-secondary/20 text-skin-secondary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                    Weekly Contest
                                </span>
                                {votingEnded && (
                                    <span className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                        Contest Closed
                                    </span>
                                )}
                                {!votingEnded && isExpired && (
                                    <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                        Voting Phase
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-skin-primary leading-tight">
                                {contest.title}
                            </h1>
                        </div>

                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm min-w-[200px]">
                            <div className="text-[10px] font-black text-skin-muted uppercase tracking-[0.2em] mb-1">
                                {isExpired ? 'Voting Ends' : 'Deadline'}
                            </div>
                            <div className={`text-lg font-bold ${votingEnded ? 'text-red-500' : isVotingPeriod ? 'text-amber-500' : 'text-skin-primary'}`}>
                                {new Date(isExpired ? contest.votingDeadline : contest.deadline).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-skin-muted font-medium">
                                at {new Date(isExpired ? contest.votingDeadline : contest.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <h3 className="text-xs font-black text-skin-secondary uppercase tracking-[0.2em] mb-4">The Prompt</h3>
                        <p className="text-xl md:text-2xl font-serif italic text-skin-text/90 leading-relaxed indent-8">
                            "{contest.description}"
                        </p>
                    </div>
                </div>

                {/* Action Area */}
                <div className="p-8 md:p-12">
                    {submission ? (
                        <div className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6 bg-green-500/10 text-green-600 px-6 py-3 rounded-2xl font-bold border border-green-500/20 w-fit">
                                <span className="text-xl">✅</span> Already Submitted
                            </div>
                            <h3 className="text-lg font-serif font-bold text-skin-primary mb-4">Your Entry:</h3>
                            <div className="bg-skin-base/50 p-8 rounded-2xl border border-skin-primary/5 font-serif italic text-lg leading-relaxed text-skin-text/80 whitespace-pre-wrap">
                                {submission.content}
                            </div>
                            <div className="mt-8">
                                <button
                                    onClick={() => votingEnded ? navigate('/leaderboard') : navigate('/')}
                                    className="px-8 py-3 bg-skin-secondary text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all"
                                >
                                    {votingEnded ? 'View Contest Results →' : 'Discover More Stories'}
                                </button>
                            </div>
                        </div>
                    ) : isExpired ? (
                        <div className="text-center py-12 bg-red-500/5 rounded-3xl border border-dashed border-red-500/30">
                            <span className="text-5xl mb-6 block">⌛</span>
                            <h2 className="text-2xl font-serif font-bold text-red-500 mb-2">Contest Ended</h2>
                            <p className="text-skin-muted mb-8 max-w-md mx-auto">
                                The deadline for this contest has passed. {votingEnded ? 'Check the final results on the leaderboard!' : 'Stay tuned for the next weekly prompt!'}
                            </p>
                            <button
                                onClick={() => votingEnded ? navigate('/leaderboard') : navigate('/')}
                                className="px-8 py-3 bg-skin-base border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/5 transition-all"
                            >
                                {votingEnded ? 'View Results (Leaderboard)' : 'Back to Dashboard'}
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif font-bold text-skin-primary">Write Your Masterpiece</h3>
                                <span className={`text-xs font-bold uppercase tracking-widest ${wordCount > 200 ? 'text-red-500' : 'text-skin-muted'}`}>
                                    {wordCount}/200 words
                                </span>
                            </div>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start writing your story here... (Max 200 words)"
                                className="w-full min-h-[400px] bg-skin-base/50 p-8 rounded-3xl border-2 border-skin-primary/10 focus:border-skin-secondary outline-none transition-all font-serif text-lg leading-relaxed placeholder:italic"
                                spellCheck="false"
                            />

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !content.trim() || wordCount > 200}
                                    className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all flex items-center gap-3 ${submitting || !content.trim() || wordCount > 200
                                        ? 'bg-skin-muted/20 text-skin-muted cursor-not-allowed opacity-50'
                                        : 'bg-skin-primary text-white hover:brightness-110 hover:-translate-y-1'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : 'Submit Story →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Gallery */}
            <div className="mt-20">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-px flex-1 bg-skin-primary/10"></div>
                    <h2 className="text-3xl font-serif font-bold text-skin-primary px-4">
                        Community Submissions
                    </h2>
                    <div className="h-px flex-1 bg-skin-primary/10"></div>
                </div>

                {submissions.length === 0 ? (
                    <div className="text-center py-20 bg-skin-card rounded-3xl border border-dashed border-skin-primary/20">
                        <span className="text-4xl mb-4 block">✍️</span>
                        <h3 className="text-xl font-serif font-bold text-skin-primary">No submissions yet</h3>
                        <p className="text-skin-muted">Be the first to share your story!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {submissions.map((sub) => (
                            <div key={sub._id} className="bg-skin-card p-8 rounded-3xl border border-skin-primary/5 shadow-xl hover:translate-y-[-4px] transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-skin-secondary/20 shadow-inner">
                                        <img
                                            src={sub.user?.profilePicture || 'https://via.placeholder.com/150'}
                                            alt={sub.user?.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-skin-primary group-hover:text-skin-secondary transition-colors">
                                            {sub.user?.username || 'Anonymous'}
                                        </h4>
                                        <p className="text-[10px] text-skin-muted font-black uppercase tracking-widest">
                                            {new Date(sub.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="font-serif italic text-skin-text/80 leading-relaxed line-clamp-6">
                                    "{sub.content}"
                                </p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <button
                                            className="text-xs font-black text-skin-secondary uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all"
                                            onClick={() => setSelectedSubmission(sub)}
                                        >
                                            Read Full Story →
                                        </button>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-skin-muted">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill={sub.votes?.some(v => (v._id ? String(v._id) : String(v)) === String(userId)) ? "currentColor" : "none"} className={`w-4 h-4 ${sub.votes?.some(v => (v._id ? String(v._id) : String(v)) === String(userId)) ? 'text-skin-primary' : 'text-skin-muted'}`}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                                </svg>
                                                <span className="text-xs font-bold">{sub.votes?.length || 0}</span>
                                            </div>

                                            {isVotingPeriod && sub.user?._id !== userId && (
                                                <button
                                                    onClick={() => handleVote(sub._id)}
                                                    disabled={votingInProgress === sub._id}
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${sub.votes?.some(v => (v._id ? String(v._id) : String(v)) === String(userId))
                                                        ? 'bg-skin-primary text-white'
                                                        : 'border-2 border-skin-primary/20 text-skin-primary hover:bg-skin-primary/5'
                                                        }`}
                                                >
                                                    {votingInProgress === sub._id ? '...' : (sub.votes?.some(v => (v._id ? String(v._id) : String(v)) === String(userId)) ? 'Voted' : 'Vote')}
                                                </button>
                                            )}
                                        </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedSubmission && (
                <SubmissionModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                />
            )}
        </div>
    );
};

export default ContestPage;
