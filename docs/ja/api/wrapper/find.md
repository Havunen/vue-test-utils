## find(selector)

::: warning Deprecation warning
コンポーネントの検索に `find` を使用することは非推奨となり、削除される予定です。代わりに `findComponent` を使用してください。
:::

最初の DOM ノードの Wrapper、またはセレクタで一致した Vue コンポーネントを返します。

有効な[セレクタ](../selectors.md)を使用してください。

- **引数:**

  - `{string|Component} selector`

- **戻り値:** `{Wrapper}`

- **例:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const div = wrapper.find('div')
expect(div.is('div')).toBe(true)

const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)

const barByName = wrapper.find({ name: 'bar' })
expect(barByName.is(Bar)).toBe(true)

const fooRef = wrapper.find({ ref: 'foo' })
expect(fooRef.is(Foo)).toBe(true)
```
