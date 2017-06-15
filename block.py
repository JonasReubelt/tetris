import pygame
import colors
import numpy as np

class Block(object):


    def __init__(self, display, width, height, side_length, kind):
        self.display = display
        self.width = width
        self.height = height
        self.side_length = side_length
        self.kind = kind
        self.configure(kind)
        self.grid_it_up()
        #self.color = RED
        self.dead = False
        self.hard_drop = False

    def configure(self, kind):
        if kind == 'square':
            self.rects = [pygame.Rect([4 * self.side_length, -self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, -self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.YELLOW
        if kind == 'stick':
            self.rects = [pygame.Rect([4 * self.side_length, -3 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.TURQUOIS
        if kind == 'L':
            self.rects = [pygame.Rect([4 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.ORANGE
        if kind == 'J':
            self.rects = [pygame.Rect([5 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, 0, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.DARKBLUE
        if kind == 'S':
            self.rects = [pygame.Rect([4 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.GREEN
        if kind == 'Z':
            self.rects = [pygame.Rect([5 * self.side_length, -2 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, -1 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([4 * self.side_length, 0, self.side_length, self.side_length])]
            self.color = colors.RED
        if kind == 'T':
            self.rects = [pygame.Rect([4 * self.side_length, 0 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, 0 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([6 * self.side_length, 0 * self.side_length, self.side_length, self.side_length]),
                          pygame.Rect([5 * self.side_length, -1 * self.side_length, self.side_length, self.side_length])]
            self.color = colors.VIOLET

    def grid_it_up(self):
        self.grids = self.rects[:]

    def drop(self, dead_rects):
        move = True
        for rect in self.rects:
            if rect.move(0, self.side_length).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(0, self.side_length)

        else:
            self.dead = True

    def draw(self):
        for rect in self.rects:
            pygame.draw.rect(self.display, self.color, rect)
        for grid in self.grids:
            pygame.draw.rect(self.display, (2 * np.array(colors.GRAY) + np.array(self.color)) / 3, grid, 2)

    def is_dead(self):
        return self.dead

    def move(self, x, dead_rects):
        move = True
        for rect in self.rects:
            if rect.move(x, 0).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(x, 0)
