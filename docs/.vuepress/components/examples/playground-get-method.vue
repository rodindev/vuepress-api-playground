<template>
  <div>
    <vuepress-api-playground url="https://jsonplaceholder.typicode.com/posts/" method="get" :showMethod="true" :data="[
      {
        name: 'userId',
        value: '1',
        type: 'number',
      },
    ]" />
  </div>
</template>