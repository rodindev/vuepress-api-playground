<template>
  <div>
    <vuepress-api-playground url="https://jsonplaceholder.typicode.com/posts/<id>" method="patch" :data="[
      {
        name: 'id',
        value: '1',
        type: 'number',
      },
      {
        name: 'title',
        value: 'Title',
        type: 'text',
      },
    ]" />
  </div>
</template>