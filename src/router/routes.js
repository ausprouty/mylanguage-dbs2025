const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [

      {
        name: 'restore',
        path: '',                // default child of "/"
        component: () => import('pages/RestorePage.vue'),
        meta: { resume: false }  // don’t store this page as lastGoodPath
      },
      {
        name: "Index",
        path: "/index",
        component: () => import("pages/IndexPage.vue"),
        meta: { appbar: 'primary' }
      },
      {
        name: "StaticPageMaster",
        path: '/page/:page([a-z0-9-]+)',
        component: () => import("pages/StaticPageMaster.vue"),
      },
      {
        name: "JesusVideoMaster",
        path: "/jvideo/:lesson?/:languageCodeHL?/:languageCodeJF?",
        component: () => import("pages/VideoMaster.vue"),
      },

      {
        name: "SeriesMaster",
        path: "/series/:study?/:lesson?/:languageCodeHL?",
        component: () => import("pages/SeriesMaster.vue"),
      },

      {
        name: "AskHisFollowers",
        path: "/questions",
        component: () => import("pages/QuestionPage.vue"),
        meta: { appbar: 'primary' }
      },
      {
        name: "reset",
        path: "/reset",
        component: () => import("pages/ResetData.vue"),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/IndexPage.vue"),
        meta: { appbar: 'primary' }
  },
];

export default routes;
