<template>
  <div>
    <VuepressApiPlayground
      url="https://jsonplaceholder.typicode.com/posts/{id}"
      method="get"
      :data="[
        {
          name: 'id',
          value: '1',
          type: 'number',
        },
      ]"
    />
  </div>
</template>