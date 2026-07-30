const fs = require('fs');

const filesToFix = ['modules/WhatsAppModule.tsx', 'modules/CitationsModule.tsx', 'modules/DashboardModule.tsx'];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace sidebarLogo with schoolLogo and add p-1 or scale down so it fits
    content = content.replace(
      /src=\{APP_CONFIG\.sidebarLogo\}.*?className="w-full h-full object-contain"/,
      'src={APP_CONFIG.schoolLogo} alt="Perfil" className="w-full h-full object-contain scale-75"'
    );
    // In case it has alt="Perfil I.E"
    content = content.replace(
      /src=\{APP_CONFIG\.sidebarLogo\} alt="Perfil I\.E" className="w-full h-full object-contain"/,
      'src={APP_CONFIG.schoolLogo} alt="Perfil I.E" className="w-full h-full object-contain scale-75"'
    );
    // For DashboardModule, it might just be the first one. Let's make it robust:
    content = content.replace(
      /src=\{APP_CONFIG\.sidebarLogo\}/g,
      'src={APP_CONFIG.schoolLogo}'
    );
    content = content.replace(
      /className="w-full h-full object-contain" referrerPolicy="no-referrer" \/>/g,
      'className="w-full h-full object-contain scale-[0.8]" referrerPolicy="no-referrer" />'
    );
    
    fs.writeFileSync(file, content);
  }
}
console.log('Logos fixed!');
