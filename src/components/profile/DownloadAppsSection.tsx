import { Download, Smartphone, Monitor, Apple } from 'lucide-react';

interface AppDownload {
  name: string;
  description: string;
  icon: string;
  platforms: {
    name: string;
    url: string;
    icon: 'android' | 'ios' | 'windows' | 'web';
  }[];
}

const apps: AppDownload[] = [
  {
    name: 'MetaTrader 5',
    description: 'Profesionalna platforma za forex i CFD trading',
    icon: '📊',
    platforms: [
      {
        name: 'Android',
        url: 'https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5',
        icon: 'android'
      },
      {
        name: 'iOS',
        url: 'https://apps.apple.com/app/metatrader-5/id413251709',
        icon: 'ios'
      },
      {
        name: 'Windows',
        url: 'https://www.metatrader5.com/en/download',
        icon: 'windows'
      }
    ]
  },
  {
    name: 'TradingView',
    description: 'Napredne chart analize i socijalna trading mreža',
    icon: '📈',
    platforms: [
      {
        name: 'Android',
        url: 'https://play.google.com/store/apps/details?id=com.tradingview.tradingviewapp',
        icon: 'android'
      },
      {
        name: 'iOS',
        url: 'https://apps.apple.com/app/tradingview-track-all-markets/id1205990992',
        icon: 'ios'
      },
      {
        name: 'Web',
        url: 'https://www.tradingview.com/',
        icon: 'web'
      }
    ]
  }
];

const PlatformIcon = ({ type }: { type: 'android' | 'ios' | 'windows' | 'web' }) => {
  switch (type) {
    case 'android':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M17.523 15.341a.996.996 0 0 1-.998-.998.998.998 0 0 1 1.996 0 .996.996 0 0 1-.998.998m-11.046 0a.996.996 0 0 1-.998-.998.998.998 0 0 1 1.996 0 .996.996 0 0 1-.998.998m11.405-6.02 1.997-3.459a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152L17.12 8.95c-1.46-.67-3.099-1.044-5.12-1.044s-3.66.374-5.12 1.044L4.841 5.447a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567l1.997 3.459C2.688 11.186.343 14.658 0 18.761h24c-.343-4.103-2.688-7.575-6.118-9.44"/>
        </svg>
      );
    case 'ios':
      return <Apple className="w-4 h-4" />;
    case 'windows':
      return <Monitor className="w-4 h-4" />;
    case 'web':
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      );
  }
};

export default function DownloadAppsSection() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        Potrebne Aplikacije
      </h3>
      
      <p className="text-muted-foreground text-sm mb-5">
        Preuzmite trading platforme za praćenje signala i izvršavanje trejdova.
      </p>

      <div className="space-y-4">
        {apps.map((app) => (
          <div 
            key={app.name}
            className="p-4 bg-muted/30 rounded-xl border border-border/50"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{app.icon}</span>
              <div>
                <h4 className="font-semibold">{app.name}</h4>
                <p className="text-sm text-muted-foreground">{app.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {app.platforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-colors text-sm"
                >
                  <PlatformIcon type={platform.icon} />
                  <span>{platform.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <h4 className="font-medium text-sm mb-2">💡 Preporuka</h4>
        <p className="text-sm text-muted-foreground">
          Za praćenje naših signala preporučujemo <strong>MetaTrader 5</strong> jer većina brokera podržava MT5 platformu. 
          <strong> TradingView</strong> koristite za dodatne analize i praćenje tržišta.
        </p>
      </div>
    </div>
  );
}
