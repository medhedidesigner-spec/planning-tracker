// Planning d'exemple affiché dans le dashboard pour montrer comment utiliser l'app.
// Données statiques, jamais en base de données — impossible à modifier ou supprimer.

export const EXAMPLE_PLANNING = {
  id: 'example',
  title: '✨ Exemple — DevOps & Cybersécurité',
  isExample: true,
  phases: [
    {
      id: 'ex-phase-1',
      title: 'Phase 1 — Bases',
      color: '#6366f1',
      weeks: [
        {
          id: 'ex-week-1',
          title: 'Semaine 1 — Linux bases',
          start_date: '2026-07-06',
          end_date: '2026-07-12',
          objectives: [
            { id: 'ex-obj-1', label: 'Navigation, fichiers, permissions (ls, cd, chmod)', url: 'https://overthewire.org/wargames/bandit/', done: true },
            { id: 'ex-obj-2', label: 'Scripting bash basique (boucles, conditions)', url: 'https://www.shellscript.sh/', done: true },
            { id: 'ex-obj-3', label: 'OverTheWire Bandit niveau 0 à 5', url: 'https://overthewire.org/wargames/bandit/bandit0.html', done: false },
          ]
        },
        {
          id: 'ex-week-2',
          title: 'Semaine 2 — Réseaux',
          start_date: '2026-07-13',
          end_date: '2026-07-19',
          objectives: [
            { id: 'ex-obj-4', label: 'Modèle OSI, TCP/IP, sous-réseaux', url: 'https://www.professormesser.com/network-plus/n10-008/n10-008-video/network-models-n10-008/', done: false },
            { id: 'ex-obj-5', label: 'Wireshark : capturer et analyser des paquets', url: 'https://www.wireshark.org/docs/wsug_html_chunked/', done: false },
          ]
        }
      ]
    },
    {
      id: 'ex-phase-2',
      title: 'Phase 2 — DevOps',
      color: '#0ea5e9',
      weeks: [
        {
          id: 'ex-week-3',
          title: 'Semaine 3 — AWS bases',
          start_date: '2026-07-20',
          end_date: '2026-07-26',
          objectives: [
            { id: 'ex-obj-6', label: 'EC2 : lancer et configurer des serveurs', url: 'https://aws.amazon.com/ec2/getting-started/', done: false },
            { id: 'ex-obj-7', label: 'S3 : stockage, buckets, permissions', url: 'https://aws.amazon.com/s3/getting-started/', done: false },
          ]
        }
      ]
    },
    {
      id: 'ex-phase-3',
      title: 'Phase 3 — Cybersécurité',
      color: '#10b981',
      weeks: [
        {
          id: 'ex-week-4',
          title: 'Semaine 4 — OWASP Top 10',
          start_date: '2026-07-27',
          end_date: '2026-08-02',
          objectives: [
            { id: 'ex-obj-8', label: 'SQLi : comprendre et exploiter', url: 'https://portswigger.net/web-security/sql-injection', done: false },
            { id: 'ex-obj-9', label: 'XSS : stored, reflected, DOM', url: 'https://portswigger.net/web-security/cross-site-scripting', done: false },
          ]
        }
      ]
    }
  ]
}
