<template>
  <q-page class="bg-white q-pa-md">
    <q-row class="q-col-gutter-md q-row-gutter-md">
      <q-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <div style="background:#ccc; padding:20px; text-align:center;">
          Tile {{ n }}
        </div>
      </q-col>
    </q-row>
  </q-page>
</template>
