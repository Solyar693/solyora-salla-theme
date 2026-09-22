import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useSlidePlayback } from '../../../app/components/common/useSlidePlayback';
beforeEach(() => {
 vi.useFakeTimers();
 vi.spyOn(window, 'matchMedia').mockReturnValue({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() } as unknown as MediaQueryList);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
it('advances every four seconds and resumes after hover and manual interaction', () => {
 const next=vi.fn(); const {result}=renderHook(()=>useSlidePlayback(3,next,vi.fn()));
 act(()=>vi.advanceTimersByTime(3999)); expect(next).toHaveBeenCalledTimes(0);
 act(()=>vi.advanceTimersByTime(1)); expect(next).toHaveBeenCalledTimes(1);
 act(()=>result.current.handlers.onPointerEnter({pointerType:'mouse'} as any));
 act(()=>vi.advanceTimersByTime(8000)); expect(next).toHaveBeenCalledTimes(1);
 act(()=>{result.current.handlers.onPointerLeave({pointerType:'mouse'} as any);result.current.restart();});
 act(()=>vi.advanceTimersByTime(4000)); expect(next).toHaveBeenCalledTimes(2);
});
it('does not autoplay a single image or reduced motion',()=>{
 const next=vi.fn();const one=renderHook(()=>useSlidePlayback(1,next,vi.fn()));
 act(()=>vi.advanceTimersByTime(8000));expect(next).not.toHaveBeenCalled();one.unmount();
 vi.mocked(window.matchMedia).mockReturnValue({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()} as unknown as MediaQueryList);
 renderHook(()=>useSlidePlayback(4,next,vi.fn()));act(()=>vi.advanceTimersByTime(8000));expect(next).not.toHaveBeenCalled();
});
it('honors explicit pause and focus, then resumes after blur',()=>{
 const next=vi.fn();const {result}=renderHook(()=>useSlidePlayback(3,next,vi.fn()));
 act(()=>result.current.setPaused(true));act(()=>vi.advanceTimersByTime(8000));expect(next).not.toHaveBeenCalled();
 act(()=>{result.current.setPaused(false);result.current.handlers.onFocusCapture();});act(()=>vi.advanceTimersByTime(8000));expect(next).not.toHaveBeenCalled();
 act(()=>result.current.handlers.onBlurCapture({currentTarget:document.createElement('div'),relatedTarget:null} as any));act(()=>vi.advanceTimersByTime(4000));expect(next).toHaveBeenCalledTimes(1);
});
it('maps a rightward swipe to next in RTL and suppresses the trailing link click',()=>{
 const next=vi.fn();const {result}=renderHook(()=>useSlidePlayback(3,vi.fn(),next));
 const el=document.createElement('div');el.dir='rtl';el.style.direction='rtl';document.body.appendChild(el);
 el.setPointerCapture=vi.fn();el.hasPointerCapture=()=>false;
 const event=(x:number)=>({currentTarget:el,target:el,button:0,pointerId:1,clientX:x,clientY:10});
 act(()=>result.current.handlers.onPointerDown(event(10) as any));act(()=>result.current.handlers.onPointerMove(event(100) as any));act(()=>result.current.handlers.onPointerUp(event(100) as any));
 expect(next).toHaveBeenCalledWith(1);
 const click={preventDefault:vi.fn(),stopPropagation:vi.fn()};result.current.handlers.onClickCapture(click as any);expect(click.preventDefault).toHaveBeenCalled();el.remove();
});
