import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-skin-base">
      <div className="relative bg-gradient-to-br from-skin-primary/20 to-skin-secondary/20 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-skin-primary mb-6">About VERSA</h1>
          <p className="text-xl text-skin-text/80 leading-relaxed">
            A collaborative storytelling platform where creativity knows no bounds
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <section className="bg-skin-card rounded-2xl p-8 shadow-lg border border-skin-primary/10">
          <h2 className="text-3xl font-bold text-skin-primary mb-4">What is VERSA?</h2>
          <p className="text-skin-text/80 leading-relaxed mb-4">
            VERSA is a unique collaborative storytelling platform that brings writers together to create 
            amazing stories. Whether you're a beginner exploring your creative side or a master storyteller, 
            VERSA provides the perfect space for you to share your imagination with the world.
          </p>
          <p className="text-skin-text/80 leading-relaxed">
            Our platform allows users to start stories and invite others to continue them, creating 
            rich, multi-author narratives that evolve organically through community collaboration.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-skin-primary mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-skin-card rounded-xl p-6 border border-skin-primary/10">
              <div className="w-12 h-12 bg-skin-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-skin-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-skin-primary mb-2">Collaborative Writing</h3>
              <p className="text-skin-text/70 text-sm">
                Start a story or continue where others left off. Build narratives together with writers worldwide.
              </p>
            </div>

            <div className="bg-skin-card rounded-xl p-6 border border-skin-primary/10">
              <div className="w-12 h-12 bg-skin-secondary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-skin-secondary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-skin-primary mb-2">Ranking System</h3>
              <p className="text-skin-text/70 text-sm">
                Progress from Beginner to Master as you contribute and create engaging stories.
              </p>
            </div>

            <div className="bg-skin-card rounded-xl p-6 border border-skin-primary/10">
              <div className="w-12 h-12 bg-skin-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-skin-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-skin-primary mb-2">Story Upvoting</h3>
              <p className="text-skin-text/70 text-sm">
                Support your favorite stories by upvoting them and help great content rise to the top.
              </p>
            </div>

            <div className="bg-skin-card rounded-xl p-6 border border-skin-primary/10">
              <div className="w-12 h-12 bg-skin-secondary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-skin-secondary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-skin-primary mb-2">User Profiles</h3>
              <p className="text-skin-text/70 text-sm">
                Showcase your stories, track contributions, and build your reputation in the community.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-skin-primary/10 to-skin-secondary/10 rounded-2xl p-8 border border-skin-primary/20">
          <h2 className="text-3xl font-bold text-skin-primary mb-4 text-center">Our Mission</h2>
          <p className="text-skin-text/80 leading-relaxed text-center max-w-2xl mx-auto">
            We believe that every person has a story to tell and that the best stories are created 
            together. VERSA aims to break down the barriers of solo writing and foster a community 
            where creativity flows freely, ideas merge seamlessly, and every contributor's voice matters.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-skin-primary mb-6 text-center">How It Works</h2>
          <div className="space-y-4">
            {[
              { num: 1, title: 'Create an Account', desc: 'Sign up and join our community of storytellers.' },
              { num: 2, title: 'Start or Contribute', desc: 'Begin your own story or continue someone else\'s adventure.' },
              { num: 3, title: 'Engage & Grow', desc: 'Upvote great stories, build your profile, and advance your rank.' },
              { num: 4, title: 'Become a Master', desc: 'Earn recognition and unlock special privileges as you contribute more.' }
            ].map(step => (
              <div key={step.num} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-skin-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-skin-primary mb-1">{step.title}</h3>
                  <p className="text-skin-text/70">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-skin-card rounded-2xl p-12 shadow-lg border border-skin-primary/10 text-center">
          <h2 className="text-3xl font-bold text-skin-primary mb-4">Ready to Start Your Story?</h2>
          <p className="text-skin-text/80 mb-6">
            Join VERSA today and become part of a creative community that brings stories to life.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-skin-secondary text-white rounded-full font-bold text-lg hover:brightness-110 shadow-lg transition-all"
          >
            Get Started
          </button>
        </section>

        <footer className="text-center text-skin-muted text-sm py-8 border-t border-skin-muted/20">
          <p>© 2026 VERSA. Built with ❤️ for storytellers everywhere.</p>
          <button
            onClick={() => navigate('/')}
            className="text-skin-secondary hover:underline mt-2"
          >
            Back to Dashboard
          </button>
        </footer>
      </div>
    </div>
  );
};

export default About;
