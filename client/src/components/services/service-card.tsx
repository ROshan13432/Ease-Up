import { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

export default function ServiceCard({ service, onClick }: ServiceCardProps) {
  // Determine background color class based on service id
  const getBgColorClass = () => {
    const colors = ["bg-primary-light", "bg-secondary", "bg-accent", "bg-[#2196F3]"];
    return colors[(service.id - 1) % colors.length];
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:bg-neutral-100 transition-all">
      <button 
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={onClick}
        aria-label={`Book ${service.name} service`}
      >
        <div className="flex items-center mb-4">
          <div className={`${getBgColorClass()} rounded-full p-3 mr-4`}>
            <span className="material-icons text-white text-3xl">{service.icon}</span>
          </div>
          <h3 className="text-2xl font-medium">{service.name}</h3>
        </div>
        <p className="text-lg text-neutral-600 mb-4">{service.shortDescription}</p>
        <div className="flex justify-end">
          <span className="text-primary font-medium flex items-center text-lg">
            Book Now
            <span className="material-icons ml-1">arrow_forward</span>
          </span>
        </div>
      </button>
    </div>
  );
}
