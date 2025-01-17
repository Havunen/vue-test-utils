## mount()

- **参数：**

  - `{Component} component`
  - `{Object} options`

- **返回值：** `{Wrapper}`

- **选项：**

移步[选项](options.md)

- **用法：**

创建一个包含被挂载和渲染的 Vue 组件的 [`Wrapper`](wrapper/)。

**Without options:**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**使用 Vue 选项：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.props().color).toBe('red')
  })
})
```

**固定在 DOM 上：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const wrapper = mount(Foo, {
      attachTo: div
    })
    expect(wrapper.contains('div')).toBe(true)
    wrapper.destroy()
  })
})
```

**默认插槽和具名插槽：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // 将匹配 `<slot name="FooBar" />`。
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**将全局属性存根：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```

**将组件存根：**

```js
import { mount } from 'vue2-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stubs: {
        BarFoo: true,
        FooBar: Faz,
        Bar: { template: '<div class="stubbed" />' }
      }
    })
    expect(wrapper.contains('.stubbed')).toBe(true)
    expect(wrapper.contains(Bar)).toBe(true)
  })
})
```

**废弃通知：**

当对组件存根时，提供一个字符串的方式 (`ComponentToStub: '<div class="stubbed" />`) 已经不再被支持。

- **延伸阅读：**[`Wrapper`](wrapper/)
