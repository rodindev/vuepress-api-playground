<template>
  <div>
    <component is="vuepress-api-playground" url="https://jsonplaceholder.typicode.com/posts/<id>" method="get" :showURL="true" :data="[
      {
        name: 'id',
        value: '1',
        type: 'number',
      },
    ]" />
  </div>
</template>