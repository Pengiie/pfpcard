import { BaseContext } from 'next/dist/shared/lib/utils'
import {
	z,
	ZodTypeAny,
	AnyZodObject,
	ZodObject,
	ZodArray,
	extendShape,
} from 'zod'
import { AuthContext } from './context'

type InferZod<T> = T extends ZodTypeAny ? z.infer<T> : T

type Resolver<
	TContext extends BaseContext = BaseContext,
	TInput = void,
	TOutput = void
> = (opts: {
	ctx: TContext
	input: InferZod<TInput>
}) => InferZod<TOutput> | Promise<InferZod<TOutput>>

type BaseProcedure<
	TContext extends BaseContext = BaseContext,
	TInput = void,
	TOutput = void
> = {
	input?: TInput
	output?: TOutput
	resolve: Resolver<TContext, TInput, TOutput>
}

type Procedure<
	TContext extends BaseContext = BaseContext,
	TInput = void,
	TOutput = void
> = TInput extends void
	? TOutput extends void
		? Omit<BaseProcedure<TContext, TInput, TOutput>, 'input' | 'output'>
		: Omit<BaseProcedure<TContext, TInput, TOutput>, 'input' | 'output'> & {
				output: TOutput
		  }
	: TOutput extends void
	? Omit<BaseProcedure<TContext, TInput, void>, 'input' | 'output'> & {
			input: TInput
	  }
	: Omit<BaseProcedure<TContext, TInput, TOutput>, 'input | output'> & {
			input: TInput
			output: TOutput
	  }

type InputWrapper<
	TWrapper extends AnyZodObject,
	TInput extends AnyZodObject | void
> = TInput extends AnyZodObject
	? ZodObject<
			extendShape<TWrapper['_shape'], TInput['_shape']>,
			TInput['_unknownKeys'],
			TInput['_catchall']
	  >
	: TWrapper

/** Wraps the input argument in the resolve function with the wrapper*/
type BaseWrappedProcedure<
	TContext extends BaseContext,
	TInputWrapper extends AnyZodObject,
	TInput extends AnyZodObject | void = void,
	TOutput = void
> = Omit<BaseProcedure<TContext, TInput, TOutput>, 'resolve'> & {
	resolve: Resolver<TContext, InputWrapper<TInputWrapper, TInput>, TOutput>
}

/** Wraps the */
type WrappedProcedure<
	TContext extends BaseContext,
	TInputWrapper extends AnyZodObject,
	TInput extends AnyZodObject | void = void,
	TOutput = void
> = Omit<
	BaseProcedure<TContext, TInput, TOutput>,
	(TOutput extends void ? 'output' : '') | 'input' | 'resolve'
> & {
	input: InputWrapper<TInputWrapper, TInput>
	resolve: Resolver<TContext, InputWrapper<TInputWrapper, TInput>, TOutput>
}

/** Infers procedure types */
export const createProcedure = <
	TContext extends BaseContext = AuthContext,
	TInput extends AnyZodObject | void = void,
	TOutput extends AnyZodObject | ZodArray<AnyZodObject> | void = void
>(
	procedure: Procedure<TContext, TInput, TOutput>
): Procedure<TContext, TInput, TOutput> => procedure

/** Returns a wrapper function that wraps the procedure's input in the given wrapper schema. */
export const createProcedureWrapper =
	<TContext extends BaseContext>() =>
	<TInputWrapper extends AnyZodObject>(wrapperSchema: TInputWrapper) =>
	<
		TInput extends AnyZodObject | void = void,
		TOutput extends AnyZodObject | ZodArray<AnyZodObject> | void = void
	>(
		procedure: BaseWrappedProcedure<TContext, TInputWrapper, TInput, TOutput>
	): WrappedProcedure<TContext, TInputWrapper, TInput, TOutput> =>
		({
			...procedure,
			input: (procedure.input
				? wrapperSchema.merge(procedure.input)
				: wrapperSchema) as InputWrapper<TInputWrapper, TInput>,
		} as unknown as WrappedProcedure<TContext, TInputWrapper, TInput, TOutput>)