import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const About = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-skin-base">
      {/* Enhanced Hero with animated background */}
      <div className="relative bg-skin-primary/10 py-24 overflow-hidden">
        <button
          onClick={() => navigate(localStorage.getItem('token') ? '/' : '/login')}
          className="absolute top-10 left-[15%] z-20 text-3xl font-serif font-black text-skin-primary tracking-tighter hover:text-skin-secondary transition-colors"
        >
          ← VERSA
        </button>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-skin-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-skin-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className={`relative max-w-4xl mx-auto px-4 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl font-bold text-skin-primary mb-6">
            About VERSA
          </h1>
          <p className="text-xl text-skin-text/90 leading-relaxed">
            A collaborative storytelling platform where creativity knows no bounds
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* What is VERSA - Your content with visual enhancement */}
        <section className={`bg-skin-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-skin-muted/10 transition-all duration-700 hover:shadow-skin-primary/20 hover:border-skin-primary/40 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
          <h2 className="text-3xl font-bold text-skin-primary mb-4">What is VERSA?</h2>
          <p className="text-skin-text/80 leading-relaxed mb-4">
            VERSA is a collaborative storytelling platform that brings writers together to create
            stories. Whether you're a beginner exploring your creative side or a master storyteller,
            VERSA provides the perfect space for you to share your imagination with the world.
          </p>
          <p className="text-skin-text/80 leading-relaxed">
            Our platform allows users to start stories and invite others to continue them, creating
            multi-author narratives that evolve organically through community collaboration.
          </p>
        </section>

        {/* Key Features with enhanced hover effects */}
        <section className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
          <h2 className="text-3xl font-bold text-skin-primary mb-6 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
                title: 'Collaborative Writing',
                desc: 'Start a story or continue where others left off. Build narratives together with writers worldwide.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
                title: 'Ranking System',
                desc: 'Progress from Beginner to Master as you contribute and create engaging stories.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
                title: 'Story Upvoting',
                desc: 'Support your favorite stories by upvoting them and help great content rise to the top.'
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
                title: 'User Profiles',
                desc: 'Showcase your stories, track contributions and build your reputation in the community.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-skin-card rounded-xl p-6 border border-skin-muted/10 hover:border-skin-primary/30 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group"
              >
                <div className="w-14 h-14 bg-skin-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-skin-primary/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-skin-primary group-hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-skin-primary mb-2 group-hover:text-skin-secondary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-skin-text/70 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission with gradient border */}
        <section className={`relative bg-skin-primary/5 rounded-2xl p-8 border-2 border-skin-primary/30 overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '600ms' }}>
          <div className="absolute inset-0 bg-skin-secondary/5 animate-pulse"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-skin-primary mb-4 text-center">Our Mission</h2>
            <p className="text-skin-text/80 leading-relaxed text-center max-w-2xl mx-auto text-lg">
              We believe that every person has a story to tell and that the best stories are created
              together. VERSA aims to break down the barriers of solo writing and foster a community
              where creativity flows freely, ideas merge seamlessly and every contributor's voice matters.
            </p>
          </div>
        </section>

        {/* How It Works - Timeline style */}
        <section className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <h2 className="text-3xl font-bold text-skin-primary mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            {[
              { num: 1, title: 'Create an Account', desc: 'Sign up and join our community of storytellers.' },
              { num: 2, title: 'Start or Contribute', desc: 'Begin your own story or continue someone else\'s adventure.' },
              { num: 3, title: 'Engage & Grow', desc: 'Upvote great stories, build your profile, and advance your rank.' },
              { num: 4, title: 'Become a Master', desc: 'Earn recognition and unlock special privileges as you contribute more.' }
            ].map(step => (
              <div key={step.num} className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-full bg-skin-primary flex items-center justify-center text-skin-on-primary font-bold text-xl flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:shadow-skin-primary/50 transition-all duration-300">
                  {step.num}
                </div>
                <div className="flex-1 bg-skin-card rounded-xl p-4 border border-skin-muted/10 group-hover:border-skin-primary/30 group-hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-bold text-skin-primary mb-1 group-hover:text-skin-secondary transition-colors">{step.title}</h3>
                  <p className="text-skin-text/70">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA with enhanced button */}
        <section className={`bg-skin-card rounded-2xl p-12 shadow-2xl border border-skin-muted/10 text-center transition-all duration-700 hover:border-skin-primary/40 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
          <h2 className="text-3xl font-bold text-skin-primary mb-4">Ready to Start Your Story?</h2>
          <p className="text-skin-text/80 mb-8 text-lg">
            Join VERSA today and become part of a creative community that brings stories to life.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="relative px-10 py-4 bg-skin-secondary text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-skin-secondary/50 hover:scale-105 transition-all duration-300 overflow-hidden group"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-skin-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center text-skin-muted text-sm py-8 border-t border-skin-muted/20">
          <p>© 2026 VERSA. For storytellers everywhere.</p>
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              navigate(token ? '/' : '/login');
            }}
            className="text-skin-secondary hover:text-skin-primary hover:underline mt-2 transition-colors"
          >
            {localStorage.getItem('token') ? 'Back to Dashboard' : 'Go to Login'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default About;
