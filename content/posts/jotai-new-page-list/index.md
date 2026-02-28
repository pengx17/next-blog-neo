
In the following two PRs the AFFiNE team rewrite the page list component. This time we use Jotai to make the component more data reactive. This means that all nodes should react to changes in the root's prop value, without having to pass props around.

- [https://github.com/toeverything/AFFiNE/pull/4530](https://github.com/toeverything/AFFiNE/pull/4530)
- [https://github.com/toeverything/AFFiNE/pull/4775](https://github.com/toeverything/AFFiNE/pull/4775)

There are several things that may need attention in the implementation.


## **Atom Provider Scoping**


we will use `createIsolation` to create a scoped provider for `<PageList />`


see [https://github.com/jotaijs/jotai-scope](https://github.com/jotaijs/jotai-scope)


```typescript
export const {
  Provider: PageListProvider,
  useAtom,
  useAtomValue,
  useSetAtom,
} = createIsolation();
```


For the atoms that is scoped in page list, we will use the `useAtom`/`useAtomValue` etc from `createIsolation` to make sure they will still work correctly if multiple page lists are rendered side by side.


## **Syncing props with atom**


We want the descendant element in the React tree to be reactive to the root props. Let's assume that the props will be synchronized with `pageListPropsAtom`. First, we need to wrap the outermost component with a provider. The provider is given initial values so that scoped atoms always have default values and we don't have to handle nulls.


```html
<PageListProvider initialValues={[[pageListPropsAtom, props]]}>
...
</PageListProvider>
```


then, add a `useEffect`  to sync props with the atom value after the first render


```typescript
useEffect(() => {
	setPageListPropsAtom(props);
}, [props, setPageListPropsAtom]);
```


## **Atom Select**


Now, the child node within the provider will have access to the scoped atom. We can create reactive atoms based on the prop value of the root list. However, one important thing to consider is that we should not always directly use `pageListPropsAtom`. This is because props will inevitably change during re-rendering, which leads to renewing `pageListPropsAtom` and causing dependent atoms to be recalculated when consuming it.


A typical solution is to use selectAtom. [https://jotai.org/docs/utilities/select](https://jotai.org/docs/utilities/select)


e.g.,


```typescript
// whether or not the table is in selection mode (showing selection checkbox & selection floating bar)
const selectionActiveAtom = atom(false);

export const selectionStateAtom = atom(
  get => {
    const baseAtom = selectAtom(
      pageListPropsAtom,
      props => {
        const { selectable, selectedPageIds, onSelectedPageIdsChange } = props;
        return {
          selectable,
          selectedPageIds,
          onSelectedPageIdsChange,
        };
      },
      shallowEqual
    );
    const baseState = get(baseAtom);
    const selectionActive =
      baseState.selectable === 'toggle'
        ? get(selectionActiveAtom)
        : baseState.selectable;
    return {
      ...baseState,
      selectionActive,
    };
  },
  (_get, set, active: boolean) => {
    set(selectionActiveAtom, active);
  }
);
```


Note: in `selectAtom` it will use a third param to let jotai to know if the atom value is changed. The default comparator is `Object.is`, but it may not work well for objects or arrays.


In the first version, we are using `isEqual` from lodash. However it seems not working well for ArrayBuffers.

