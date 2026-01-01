import { UserPlus, Search, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: "Create Account",
      description: "Sign up as a player or stadium owner in seconds. Choose your role and set up your profile.",
    },
    {
      icon: Search,
      number: "02",
      title: "Discover & Connect",
      description: "Players find stadiums and teams. Owners list their pitches and set availability.",
    },
    {
      icon: CheckCircle,
      number: "03",
      title: "Book & Play",
      description: "Reserve your slot, confirm the booking, and get ready for your match!",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in three simple steps. No complicated setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="card-stadium p-8 text-center relative z-10 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary rounded-full">
                  <span className="font-display text-sm text-primary-foreground">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center transition-all group-hover:bg-primary/20 group-hover:scale-110 mt-4">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6">
                    <ArrowRight className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
