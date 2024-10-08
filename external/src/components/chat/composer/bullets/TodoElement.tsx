import { useCallback, useEffect, useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { motion, useAnimation } from 'framer-motion';

import cx from 'classnames';
import { todoContainerStyles, todoStyles } from 'common/ui/editorStyles.ts';
import { CheckBox } from 'external/src/components/CheckBox.tsx';
import type { MessageTodoNode } from '@cord-sdk/types';
import { ComposerContext } from 'external/src/context/composer/ComposerContext.ts';
import { SetShakingTodoAction } from 'external/src/context/composer/actions/SetShakingTodo.ts';
import { getShakeKeyframes } from 'external/src/lib/animation.ts';
import { useComposerTask } from 'external/src/components/chat/composer/hooks/useComposerTask.ts';
import { useContextThrowingIfNoProvider } from 'external/src/effects/useContextThrowingIfNoProvider.ts';
import { withNewCSSComponentMaybe } from 'external/src/components/ui3/withNewComponent.tsx';
import { newTodoElement } from 'external/src/components/ui3/composer/TodoElement.tsx';
import { Sizes } from 'common/const/Sizes.ts';

const useStyles = createUseStyles({
  container: todoStyles,
  done: {
    '& p': {
      textDecoration: 'line-through',
    },
  },
  checkboxContainer: todoContainerStyles,
});

type Props = {
  attributes: any;
  children: any;
  todoNode: MessageTodoNode;
};

/**
 * @deprecated Use `ui3/composer/TodoElement` instead
 */
export const TodoElement = withNewCSSComponentMaybe(
  newTodoElement,
  function TodoElement({ attributes, children, todoNode }: Props) {
    const todoHeight = Sizes.DEFAULT_LINE_HEIGHT_PX;

    const {
      dispatch,
      state: { shakingTodoID },
    } = useContextThrowingIfNoProvider(ComposerContext);

    const { addTodo, removeTodo, updateTodo, task } = useComposerTask();

    const todo = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-shadow -- Disabling for pre-existing problems. Please do not copy this comment, and consider fixing this one!
      return task?.todos.find((todo) => todo.id === todoNode.todoID);
    }, [task?.todos, todoNode.todoID]);

    // Add and remove todo from ComposerContext on mount/unmount
    useEffect(() => {
      const todoID = todoNode.todoID;
      addTodo({ id: todoID, done: false });
      return () => {
        removeTodo(todoID);
      };
    }, [addTodo, removeTodo, todoNode.todoID]);

    const setDone = useCallback(
      (done: boolean) => {
        if (todo) {
          updateTodo({ ...todo, done });
        }
      },
      [todo, updateTodo],
    );

    const done = todo?.done ?? false;
    const classes = useStyles();

    const controls = useAnimation();

    useEffect(() => {
      if (shakingTodoID === todoNode.todoID) {
        void controls.start({
          translateX: getShakeKeyframes({ shakes: 3, distance: 3 }),
          transition: { duration: 0.4 },
        });
        dispatch(SetShakingTodoAction(null));
      }
    }, [shakingTodoID, todoNode.todoID, dispatch, controls]);

    return (
      <div
        className={cx(classes.container, {
          [classes.done]: done,
        })}
        {...attributes}
      >
        {children}
        <div
          style={{ height: todoHeight }}
          className={classes.checkboxContainer}
          contentEditable={false}
        >
          <motion.div animate={controls}>
            <CheckBox done={done} setDone={setDone} />
          </motion.div>
        </div>
      </div>
    );
  },
);
