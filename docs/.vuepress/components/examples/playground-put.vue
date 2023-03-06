<template>
  <div>
    <component is="vuepress-api-playground" url="https://jsonplaceholder.typicode.com/posts/<id>" method="put" :data="[
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
      {
        name: 'body',
        value: 'Body',
        type: 'text',
      },
      {
        name: 'userId',
        value: '1',
        type: 'number',
      },
    ]" />
  </div>
</template>