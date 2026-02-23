import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const ContestPage = () => {
    const [contest, setContest] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
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
            setToast({ message: 'Story cannot be empty', type: 'error' });
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
                setToast({ message: 'Story submitted successfully! Good luck!', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ message: data.msg || 'Submission failed', type: 'error' });
            }
        } catch (err) {
            console.error("Submission error:", err);
            setToast({ message: 'Error submitting story', type: 'error' });
        } finally {
            setSubmitting(false);
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

    const isExpired = new Date() > new Date(contest.deadline);

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
                                {isExpired && (
                                    <span className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                        Contest Ended
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-skin-primary leading-tight">
                                {contest.title}
                            </h1>
                        </div>

                        <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm min-w-[200px]">
                            <div className="text-[10px] font-black text-skin-muted uppercase tracking-[0.2em] mb-1">
                                Deadline
                            </div>
                            <div className={`text-lg font-bold ${isExpired ? 'text-red-500' : 'text-skin-primary'}`}>
                                {new Date(contest.deadline).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-skin-muted font-medium">
                                at {new Date(contest.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                <button onClick={() => navigate('/')} className="px-8 py-3 bg-skin-secondary text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all">
                                    Discover More Stories
                                </button>
                            </div>
                        </div>
                    ) : isExpired ? (
                        <div className="text-center py-12 bg-red-500/5 rounded-3xl border border-dashed border-red-500/30">
                            <span className="text-5xl mb-6 block">⌛</span>
                            <h2 className="text-2xl font-serif font-bold text-red-500 mb-2">Contest Ended</h2>
                            <p className="text-skin-muted mb-8 max-w-md mx-auto">
                                The deadline for this contest has passed. Stay tuned for the next weekly prompt!
                            </p>
                            <button onClick={() => navigate('/')} className="px-8 py-3 bg-skin-base border border-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/5 transition-all">
                                Back to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif font-bold text-skin-primary">Write Your Masterpiece</h3>
                                <span className="text-xs text-skin-muted font-bold uppercase tracking-widest">
                                    {content.length} characters
                                </span>
                            </div>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start writing your story here..."
                                className="w-full min-h-[400px] bg-skin-base/50 p-8 rounded-3xl border-2 border-skin-primary/10 focus:border-skin-secondary outline-none transition-all font-serif text-lg leading-relaxed placeholder:italic"
                                spellCheck="false"
                            />

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !content.trim()}
                                    className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all flex items-center gap-3 ${submitting || !content.trim()
                                            ? 'bg-skin-muted/20 text-skin-muted cursor-not-allowed'
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

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default ContestPage;
