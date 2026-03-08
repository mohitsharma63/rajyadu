import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  primaryAction: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export default function HeroBanner({
  title,
  subtitle,
  description,
  imageUrl,
  primaryAction,
  secondaryAction,
}: HeroBannerProps) {
  return (
    <section className="relative bg-gradient-to-r from-amber-50 to-neutral-50 py-20">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
              PayDay Sale - B1G1 FREE
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {title}{" "}
              <span className="text-primary">{subtitle}</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              {description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="btn-primary"
                onClick={primaryAction.onClick}
              >
                {primaryAction.text}
              </Button>
              
              {secondaryAction && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="btn-secondary"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <img
              src={imageUrl}
              alt="Hero banner"
              className="rounded-2xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
