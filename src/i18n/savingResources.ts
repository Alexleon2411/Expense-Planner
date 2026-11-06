import i18n from './config'

const resources = {
  en: {
    expense: {
      savingContributionName: 'Contribution name',
      savingContributionPlaceholder: 'e.g. Monthly deposit',
      savingContributionNote: 'Note (optional)',
      savingContributionNotePlaceholder: 'Add a note about this contribution...',
      legacySavingLabel: 'Historical saving',
      legacySavingReadonly: 'This older saving record is kept as read-only history. New contributions are recorded directly in a saving plan.',
    },
    dashboard: {
      savingContributionHistory: 'Contribution history',
      savingContributionEmpty: 'No contributions for this plan yet.',
      savingContributionLoadError: 'Could not load contributions for this plan.',
      savingContributionRetry: 'Retry',
      savingContributionDelete: 'Delete contribution',
      savingContributionDeleteConfirm: 'Delete this contribution? The plan total will be reduced.',
    },
  },
  es: {
    expense: {
      savingContributionName: 'Nombre del aporte',
      savingContributionPlaceholder: 'Ej. Aporte mensual',
      savingContributionNote: 'Nota (opcional)',
      savingContributionNotePlaceholder: 'Añade una nota sobre este aporte...',
      legacySavingLabel: 'Ahorro histórico',
      legacySavingReadonly: 'Este registro antiguo se conserva como historial de solo lectura. Los nuevos aportes se registran directamente en un plan.',
    },
    dashboard: {
      savingContributionHistory: 'Historial de aportes',
      savingContributionEmpty: 'Este plan aún no tiene aportes.',
      savingContributionLoadError: 'No se pudieron cargar los aportes de este plan.',
      savingContributionRetry: 'Reintentar',
      savingContributionDelete: 'Eliminar aporte',
      savingContributionDeleteConfirm: '¿Eliminar este aporte? Se descontará del total reunido del plan.',
    },
  },
  fr: {
    expense: {
      savingContributionName: 'Libellé de la contribution',
      savingContributionPlaceholder: 'Ex. Versement mensuel',
      savingContributionNote: 'Note (facultative)',
      savingContributionNotePlaceholder: 'Ajouter une note sur cette contribution...',
      legacySavingLabel: 'Épargne historique',
      legacySavingReadonly: 'Cet ancien enregistrement est conservé en lecture seule. Les nouvelles contributions sont enregistrées directement dans un plan.',
    },
    dashboard: {
      savingContributionHistory: 'Historique des contributions',
      savingContributionEmpty: 'Aucune contribution pour ce plan.',
      savingContributionLoadError: 'Impossible de charger les contributions de ce plan.',
      savingContributionRetry: 'Réessayer',
      savingContributionDelete: 'Supprimer la contribution',
      savingContributionDeleteConfirm: 'Supprimer cette contribution ? Le total du plan sera réduit.',
    },
  },
  it: {
    expense: {
      savingContributionName: 'Nome del versamento',
      savingContributionPlaceholder: 'Es. Versamento mensile',
      savingContributionNote: 'Nota (facoltativa)',
      savingContributionNotePlaceholder: 'Aggiungi una nota su questo versamento...',
      legacySavingLabel: 'Risparmio storico',
      legacySavingReadonly: 'Questo vecchio record è conservato come cronologia in sola lettura. I nuovi versamenti vengono registrati direttamente in un piano.',
    },
    dashboard: {
      savingContributionHistory: 'Storico dei versamenti',
      savingContributionEmpty: 'Nessun versamento per questo piano.',
      savingContributionLoadError: 'Impossibile caricare i versamenti di questo piano.',
      savingContributionRetry: 'Riprova',
      savingContributionDelete: 'Elimina versamento',
      savingContributionDeleteConfirm: 'Eliminare questo versamento? Il totale del piano diminuirà.',
    },
  },
  nl: {
    expense: {
      savingContributionName: 'Naam van de storting',
      savingContributionPlaceholder: 'Bijv. maandelijkse storting',
      savingContributionNote: 'Notitie (optioneel)',
      savingContributionNotePlaceholder: 'Voeg een notitie toe over deze storting...',
      legacySavingLabel: 'Historische storting',
      legacySavingReadonly: 'Deze oude storting is bewaard als alleen-lezen geschiedenis. Nieuwe stortingen worden rechtstreeks aan een spaarplan toegevoegd.',
    },
    dashboard: {
      savingContributionHistory: 'Stortingsgeschiedenis',
      savingContributionEmpty: 'Nog geen stortingen voor dit plan.',
      savingContributionLoadError: 'De stortingen voor dit plan konden niet worden geladen.',
      savingContributionRetry: 'Opnieuw proberen',
      savingContributionDelete: 'Storting verwijderen',
      savingContributionDeleteConfirm: 'Deze storting verwijderen? Het spaarsaldo van het plan wordt verlaagd.',
    },
  },
} as const

Object.entries(resources).forEach(([language, value]) => {
  i18n.addResourceBundle(language, 'translation', value, true, true)
})
