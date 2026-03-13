import { GuideStep } from '../types';

export const getHajjSteps = (t: (key: string) => string): GuideStep[] => [
  {
    id: 1,
    title: t('step1Title'),
    arabicTitle: "الإحرام",
    description: t('step1Desc'),
    procedure: [
      t('step1Proc1'),
      t('step1Proc2'),
      t('step1Proc3'),
      t('step1Proc4')
    ],
    location: t('step1Loc'),
    notes: t('step1Note')
  },
  {
    id: 2,
    title: t('step2Title'),
    arabicTitle: "طواف القدوم",
    description: t('step2Desc'),
    procedure: [
      t('step2Proc1'),
      t('step2Proc2'),
      t('step2Proc3')
    ],
    location: t('step2Loc'),
    notes: t('step2Note')
  },
  {
    id: 3,
    title: t('step3Title'),
    arabicTitle: "السعي",
    description: t('step3Desc'),
    procedure: [
      t('step3Proc1'),
      t('step3Proc2'),
      t('step3Proc3')
    ],
    location: t('step3Loc'),
    notes: t('step3Note')
  },
  {
    id: 4,
    title: t('step4Title'),
    arabicTitle: "يوم التروية",
    description: t('step4Desc'),
    procedure: [
      t('step4Proc1'),
      t('step4Proc2'),
      t('step4Proc3')
    ],
    location: t('step4Loc'),
    notes: t('step4Note')
  },
  {
    id: 5,
    title: t('step5Title'),
    arabicTitle: "يوم عرفة",
    description: t('step5Desc'),
    procedure: [
      t('step5Proc1'),
      t('step5Proc2'),
      t('step5Proc3')
    ],
    location: t('step5Loc'),
    notes: t('step5Note')
  },
  {
    id: 6,
    title: t('step6Title'),
    arabicTitle: "مزدلفة",
    description: t('step6Desc'),
    procedure: [
      t('step6Proc1'),
      t('step6Proc2'),
      t('step6Proc3'),
      t('step6Proc4')
    ],
    location: t('step6Loc'),
    notes: t('step6Note')
  },
  {
    id: 7,
    title: t('step7Title'),
    arabicTitle: "رمي الجمرات",
    description: t('step7Desc'),
    procedure: [
      t('step7Proc1'),
      t('step7Proc2'),
      t('step7Proc3')
    ],
    location: t('step7Loc'),
    notes: t('step7Note')
  },
  {
    id: 8,
    title: t('step8Title'),
    arabicTitle: "الهدي والتحلل",
    description: t('step8Desc'),
    procedure: [
      t('step8Proc1'),
      t('step8Proc2'),
      t('step8Proc3')
    ],
    location: t('step8Loc'),
    notes: t('step8Note')
  },
  {
    id: 9,
    title: t('step9Title'),
    arabicTitle: "طواف الإفاضة",
    description: t('step9Desc'),
    procedure: [
      t('step9Proc1'),
      t('step9Proc2'),
      t('step9Proc3')
    ],
    location: t('step9Loc'),
    notes: t('step9Note')
  },
  {
    id: 10,
    title: t('step10Title'),
    arabicTitle: "أيام التشريق",
    description: t('step10Desc'),
    procedure: [
      t('step10Proc1'),
      t('step10Proc2'),
      t('step10Proc3')
    ],
    location: t('step10Loc'),
    notes: t('step10Note')
  },
  {
    id: 11,
    title: t('step11Title'),
    arabicTitle: "طواف الوداع",
    description: t('step11Desc'),
    procedure: [
      t('step11Proc1'),
      t('step11Proc2'),
      t('step11Proc3')
    ],
    location: t('step11Loc'),
    notes: t('step11Note')
  }
];
