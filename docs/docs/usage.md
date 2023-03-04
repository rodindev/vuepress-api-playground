# Usage

## Examples

To use the VuePress API Playground component in your documentation, you can add it to any Markdown file in your VuePress project. Here is an example of how to use the component:

``` vue
  <vuepress-api-playground
    url="https://jsonplaceholder.typicode.com/posts/"
    method="get"
    :data="[
      {
        name: 'userId',
        value: '1',
        type: 'number',
      },
    ]"
  />
```

In this example, we are using the ``vuepress-api-playground`` component to make a GET request to the ``https://jsonplaceholder.typicode.com/posts/`` URL, with a query parameter of ``userId=1``. You can customize the request by modifying the url, method, and data props of the component.

This is an example of how to use a parameter in a URL:

``` vue
  <vuepress-api-playground 
    url="https://jsonplaceholder.typicode.com/posts/<id>" 
    method="get" 
    :data="[
      {
        name: 'id',
        value: '1',
        type: 'number',
      },
    ]" 
  />
```

In this example, the URL ``https://jsonplaceholder.typicode.com/posts/<id>`` includes the parameter ``<id>``, which will be replaced with a specific value when the API call is made. The ``data`` must include the parameter from the URL.

When the component is rendered, it will make a GET request to the URL ``https://jsonplaceholder.typicode.com/posts/1``.

Check out our [Examples page](/examples/) for more examples of how to use our API.

## Properties

| Property | Type | Required | Description |
| -------- | ---- | -------- | ----------- |
| ``url`` | String | true | The URL of the API endpoint. |
| ``method`` | String | true | The HTTP method of the request (e.g. "get", "post", "put", "delete", etc.). |
| ``data`` | Array | false | An array of objects that specify the key-value pairs to be sent with the request. Each object should have a ``name`` property (for the key), a ``value`` property (for the value), and a ``type`` property (for the type of input field to render). |
| ``headers`` | Object | false | An object of headers to be sent along with the API request. Default is ``{ 'Content-Type': 'application/json' }``. |
| ``showMethod`` | Boolean | false | Whether to display the HTTP method of the request in the component's header. Default is false. |
| ``showURL`` | Boolean | false | Whether to display the URL of the request in the component's header. Default is false. |
| ``headingTag`` | String | false | The HTML tag used for headings in the component. Default is "h4". |

<!-- ## Source Code

<SourceCode>
<<< @/src/components/Playground/Playground.vue
</SourceCode> -->