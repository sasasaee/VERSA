const ContestSidebar = () => {
  return (
    <div className="hidden lg:block w-full sticky top-24 h-fit">
      <div className="bg-skin-card p-6 rounded-2xl shadow-lg border-l-4 border-skin-secondary">
        <h3 className="font-serif font-bold text-xl text-skin-primary mb-4">🏆 Weekly Prompt</h3>
        <p className="text-skin-text text-sm mb-4 leading-relaxed">
          "The lamp flickered, not because the bulb was dying, but because something was draining the electricity from the air..."
        </p>
        <div className="text-xs font-bold text-skin-muted uppercase tracking-wider mb-2">
          Genre: Horror
        </div>
        <button className="w-full py-2 bg-skin-base hover:bg-skin-primary/20 text-skin-primary font-bold rounded-lg transition-colors text-sm">
          Participate Now
        </button>
      </div>
    </div>
  );
};

export default ContestSidebar;